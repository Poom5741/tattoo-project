import { useState } from "react";
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { State } from "wagmi";
import WalletProvider from "./WalletProvider";
import { CHAIN_ID, CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/config/contract";

interface VoucherPayload {
  tokenId: string;
  designId: string;
  price: string;
  artistTreasury: string;
  expiry: string;
  buyer: string;
  cidHash: string;
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

function fmtEth(v: number | null | undefined) {
  if (!v) return "—";
  return v.toFixed(3) + " ETH";
}

function CheckoutFlowInner({ design }: CheckoutFlowInnerProps) {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract();
  const { isLoading: isWaiting, isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 3,
  });

  const [voucherData, setVoucherData] = useState<{ voucher: VoucherPayload; signature: string; cid: string } | null>(null);
  const [isFetchingVoucher, setIsFetchingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const price = design.price;
  const fee = price != null ? +(price * 0.025).toFixed(3) : 0;
  const total = price != null ? +(price + fee).toFixed(3) : 0;

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

  const onAcquire = async () => {
    if (!voucherData) {
      await fetchVoucher();
      return;
    }
    const { voucher, signature, cid } = voucherData;
    const voucherArgs = {
      tokenId: BigInt(voucher.tokenId),
      designId: voucher.designId,
      price: BigInt(voucher.price),
      artistTreasury: voucher.artistTreasury as `0x${string}`,
      expiry: BigInt(voucher.expiry),
      buyer: voucher.buyer as `0x${string}`,
      cidHash: voucher.cidHash as `0x${string}`,
    };

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "mintWithVoucher",
      args: [voucherArgs, signature as `0x${string}`, cid],
      value: BigInt(voucher.price),
    });
  };

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
                  ["Plate price", fmtEth(price)],
                  ["Gallery fee (2.5%)", fmtEth(fee)],
                  ["≈ in USD", price != null ? `$${Math.round(total * 2480).toLocaleString()}` : "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="mono dim" style={{ fontSize: 13 }}>{k}</span>
                    <span className="mono" style={{ fontSize: 13 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)", marginTop: 6 }}>
                  <span className="mono" style={{ fontSize: 14 }}>Total</span>
                  <span className="display" style={{ fontSize: 30 }}>{fmtEth(total)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="display" style={{ fontSize: 24, marginBottom: 20 }}>Payment</h3>

              {!isConnected ? (
                <div style={{ padding: "32px 0" }}>
                  <p className="dim" style={{ fontSize: 14, marginBottom: 20 }}>Connect your wallet to acquire this plate.</p>
                  <ConnectButton />
                </div>
              ) : onWrongChain ? (
                <div style={{ padding: "24px 0" }}>
                  <p className="dim" style={{ fontSize: 14, marginBottom: 16 }}>Please switch to Base Sepolia to continue.</p>
                  <button
                    className="btn btn--solid btn--lg"
                    onClick={() => switchChain({ chainId: CHAIN_ID })}
                  >
                    Switch to Base Sepolia
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

                  <button
                    className="btn btn--solid btn--block btn--lg"
                    disabled={isFetchingVoucher || isWriting || isWaiting || isConfirming || txConfirmed}
                    onClick={voucherData ? onAcquire : fetchVoucher}
                  >
                    {isFetchingVoucher
                      ? "Reserving…"
                      : isWriting
                      ? "Awaiting wallet…"
                      : isWaiting
                      ? "Waiting for confirmations…"
                      : isConfirming
                      ? "Confirming…"
                      : txConfirmed
                      ? "Confirmed!"
                      : voucherData
                      ? `Confirm acquisition · ${fmtEth(total)}`
                      : `Acquire this plate · ${fmtEth(total)}`}
                  </button>
                  <p className="mono faint" style={{ fontSize: 10.5, textAlign: "center", marginTop: 14, letterSpacing: ".06em" }}>
                    Funds held in escrow until certificate is issued
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface CheckoutFlowProps {
  design: DesignData;
  initialState?: State;
}

export default function CheckoutFlow({ design, initialState }: CheckoutFlowProps) {
  return (
    <WalletProvider initialState={initialState}>
      <CheckoutFlowInner design={design} />
    </WalletProvider>
  );
}
