import { useState } from "react";
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import WalletProvider from "./WalletProvider";
import { CHAIN_ID, CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS } from "../lib/config/contract";

interface VoucherPayload {
  tokenId: string;
  designId: string;
  price: string;
  artistTreasury: string;
  expiry: string;
  buyer: string;
  cidHash: string;
  soulbound: boolean;
  royaltyBps: number;
}

interface DesignData {
  id: string;
  n: string;
  title: string;
  artist_id?: string;
  artistId?: string;
  style: string | null;
  price: number | null;
  price_usd?: number | null;
  priceUsd?: number | null;
  status: string;
  placement: string | null;
  seed: number | null;
}

interface CheckoutFlowInnerProps {
  design: DesignData;
}

function fmtUsdt(v: number | null | undefined) {
  if (!v) return "—";
  return v.toFixed(2) + " USDT";
}

function CheckoutFlowInner({ design }: CheckoutFlowInnerProps) {
  const { address, isConnected, chain } = useAccount();
  const { login } = usePrivy();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract();
  const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isWaiting, isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 3,
  });
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const [voucherData, setVoucherData] = useState<{ voucher: VoucherPayload; signature: string; cid: string } | null>(null);
  const [isFetchingVoucher, setIsFetchingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [usdtApproved, setUsdtApproved] = useState(false);

  const price = design.price;
  // Platform fee is 3% (included in contract split, not added on top)
  const platformFee = price != null ? +(price * 0.03).toFixed(2) : 0;

  const onWrongChain = isConnected && chain?.id !== CHAIN_ID;

  const fetchVoucher = async () => {
    if (!address) return;
    setIsFetchingVoucher(true);
    setVoucherError(null);
    try {
      const res = await fetch("/api/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId: design.id, buyer: address }),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        setVoucherError(err.error === "not_available" ? "This plate is no longer available." : "Failed to acquire plate. Please try again.");
        return;
      }
      const data = await res.json() as { voucher: VoucherPayload; signature: string; cid: string };
      setVoucherData(data);
    } catch {
      setVoucherError("Network error. Please try again.");
    } finally {
      setIsFetchingVoucher(false);
    }
  };

  // Step 1: Approve USDT spending
  const onApproveUsdt = () => {
    if (!voucherData) return;
    const { voucher } = voucherData;
    writeApprove({
      address: USDT_ADDRESS,
      abi: [
        {
          type: "function",
          name: "approve",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
        },
      ] as const,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, BigInt(voucher.price)],
    });
  };

  // Step 2: Mint after approval
  const onMint = () => {
    if (!voucherData) return;
    const { voucher, signature, cid } = voucherData;
    const voucherArgs = {
      tokenId: BigInt(voucher.tokenId),
      designId: voucher.designId,
      price: BigInt(voucher.price),
      artistTreasury: voucher.artistTreasury as `0x${string}`,
      expiry: BigInt(voucher.expiry),
      buyer: voucher.buyer as `0x${string}`,
      cidHash: voucher.cidHash as `0x${string}`,
      soulbound: voucher.soulbound,
      royaltyBps: BigInt(voucher.royaltyBps),
    };

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "mintWithVoucher",
      args: [voucherArgs, signature as `0x${string}`, cid],
    });
  };

  const onAcquire = async () => {
    if (!voucherData) {
      await fetchVoucher();
      return;
    }
    if (!usdtApproved && !approveConfirmed) {
      onApproveUsdt();
      return;
    }
    onMint();
  };

  // Mark USDT as approved when approval tx confirms
  if (approveConfirmed && !usdtApproved) {
    setUsdtApproved(true);
  }

  const confirmMint = async (hash: string, tokenId: string) => {
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash, tokenId: Number(tokenId) }),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        setConfirmError("Confirmation failed: " + err.error);
        return;
      }
      setDone(true);
      setTimeout(() => {
        window.location.href = "/wallet";
      }, 2000);
    } catch {
      setConfirmError("Failed to confirm transaction. Please contact support.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (txConfirmed && txHash && voucherData && !done && !isConfirming && !confirmError) {
    confirmMint(txHash, voucherData.voucher.tokenId);
  }

  if (done) {
    return (
      <div className="fade-in">
        <section style={{ padding: "72px 0 100px" }}>
          <div className="wrap" style={{ maxWidth: 700 }}>
            <div style={{ textAlign: "center" }}>
              <div className="cert__seal" style={{ width: 56, height: 56, margin: "0 auto 26px", fontSize: 12 }}>✓</div>
              <div className="kicker" style={{ marginBottom: 16 }}>Plate claimed</div>
              <h1 className="display" style={{ fontSize: 48 }}>It&apos;s yours alone.</h1>
              <p className="dim" style={{ fontSize: 15, margin: "18px auto 36px", maxWidth: "46ch" }}>
                &ldquo;{design.title}&rdquo; has left the gallery and been retired. The certificate of authenticity is now in your collection.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/wallet" className="btn btn--solid btn--lg">View collection</a>
              <a href="/market" className="btn btn--ghost btn--lg">Back to gallery</a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section style={{ padding: "32px 0 90px" }}>
        <div className="wrap" style={{ maxWidth: 980 }}>
          <a href={`/design/${design.id}`} className="back-link">← Back to plate</a>
          <h1 className="display" style={{ fontSize: "clamp(34px,5vw,56px)", marginBottom: 36 }}>Acquire the plate</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
            <div>
              <div style={{ display: "flex", gap: 18, paddingBottom: 24, borderBottom: "1px solid var(--line)", marginBottom: 24 }}>
                <div>
                  <div className="mono dim" style={{ fontSize: 11, marginBottom: 8 }}>AVAILABLE</div>
                  <h3 className="display" style={{ fontSize: 26, margin: "12px 0 6px" }}>{design.title}</h3>
                  <div className="mono dim" style={{ fontSize: 12 }}>{design.style}</div>
                  <div className="mono faint" style={{ fontSize: 11, marginTop: 10 }}>№ {design.n} / 001 · {design.placement}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Plate price", fmtUsdt(price)],
                  ["Platform fee (3%)", fmtUsdt(platformFee)],
                  ["Artist receives", price != null ? fmtUsdt(price - platformFee) : "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="mono dim" style={{ fontSize: 13 }}>{k}</span>
                    <span className="mono" style={{ fontSize: 13 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)", marginTop: 6 }}>
                  <span className="mono" style={{ fontSize: 14 }}>You pay</span>
                  <span className="display" style={{ fontSize: 30 }}>{fmtUsdt(price)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="display" style={{ fontSize: 24, marginBottom: 20 }}>Payment</h3>

              {!isConnected ? (
                <div style={{ padding: "32px 0" }}>
                  <p className="dim" style={{ fontSize: 14, marginBottom: 20 }}>Connect your wallet to acquire this plate.</p>
                  <button className="btn btn--solid btn--lg" onClick={login}>Connect & Sign in</button>
                </div>
              ) : onWrongChain ? (
                <div style={{ padding: "24px 0" }}>
                  <p className="dim" style={{ fontSize: 14, marginBottom: 16 }}>Please switch to BSC Testnet to continue.</p>
                  <button
                    className="btn btn--solid btn--lg"
                    onClick={() => switchChain({ chainId: CHAIN_ID })}
                  >
                    Switch to BSC
                  </button>
                </div>
              ) : (
                <>
                  <div className="field" style={{ marginBottom: 20 }}>
                    <label>Connected wallet</label>
                    <div className="input mono" style={{ padding: "10px 14px", opacity: 0.7, fontSize: 12 }}>
                      {address?.slice(0, 6)}…{address?.slice(-4)}
                    </div>
                  </div>

                  {(voucherError || writeError || confirmError) && (
                    <div style={{ padding: "12px 16px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", marginBottom: 16, fontSize: 13 }} className="mono">
                      {voucherError || (writeError ? writeError.message.split("\n")[0] : null) || confirmError}
                    </div>
                  )}

                  <label style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "6px 0 24px", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ marginTop: 3 }} />
                    <span className="dim" style={{ fontSize: 12.5 }}>I understand this plate is one-of-one. On purchase it is permanently retired from the gallery.</span>
                  </label>

                  {voucherData && !usdtApproved && !approveConfirmed && (
                    <div style={{ padding: "10px 14px", background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)", marginBottom: 16, fontSize: 12.5 }} className="mono">
                      Step 1 of 2: Approve USDT spending, then mint
                    </div>
                  )}
                  <button
                    className="btn btn--solid btn--block btn--lg"
                    disabled={isFetchingVoucher || isApproving || isWriting || isWaiting || isConfirming || txConfirmed}
                    onClick={onAcquire}
                  >
                    {isFetchingVoucher
                      ? "Reserving…"
                      : isApproving
                      ? "Approving USDT…"
                      : isWriting
                      ? "Awaiting wallet…"
                      : isWaiting
                      ? "Waiting for confirmations…"
                      : isConfirming
                      ? "Confirming…"
                      : txConfirmed
                      ? "Confirmed!"
                      : !voucherData
                      ? `Acquire this plate · ${fmtUsdt(price)}`
                      : (!usdtApproved && !approveConfirmed)
                      ? `Approve USDT · ${fmtUsdt(price)}`
                      : `Mint · ${fmtUsdt(price)}`}
                  </button>
                  <p className="mono faint" style={{ fontSize: 10.5, textAlign: "center", marginTop: 14, letterSpacing: ".06em" }}>
                    Payment processed on BSC via USDT (BEP-20)
                  </p>
                  <button
                    style={{ width: "100%", marginTop: 12, padding: "10px 0", background: "transparent", border: "1px solid var(--line)", color: "var(--fg-dim)", fontSize: 13, cursor: "pointer" }}
                    onClick={() => window.alert("PaySolution integration coming soon")}
                  >
                    Pay with PaySolution (alternative)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CheckoutFlow({ design }: { design: DesignData }) {
  return (
    <WalletProvider>
      <CheckoutFlowInner design={design} />
    </WalletProvider>
  );
}
