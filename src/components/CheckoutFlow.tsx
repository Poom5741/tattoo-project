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
      <section className="py-[72px] pb-[100px]">
        <div className="max-w-[700px] mx-auto px-5 md:px-16">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-body font-bold text-lg mx-auto mb-6">✓</div>
            <div className="font-body font-semibold text-label-sm tracking-[0.2em] uppercase text-primary-container mb-4">Plate claimed</div>
            <h1 className="font-display font-semibold text-on-surface text-display-lg-mobile md:text-display-lg">It&apos;s yours alone.</h1>
            <p className="text-on-surface-variant text-body-md mt-[18px] mx-auto mb-9 max-w-[46ch]">
              &ldquo;{design.title}&rdquo; has left the gallery and been retired. The certificate of authenticity is now in your collection.
            </p>
          </div>
          <div className="flex gap-3 mt-7 justify-center flex-wrap">
            <a href="/wallet" className="btn-primary">View collection</a>
            <a href="/market" className="btn-secondary">Back to gallery</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 pb-[90px]">
      <div className="max-w-container-max mx-auto px-5 md:px-16">
        <a href={`/design/${design.id}`} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 font-body text-body-md">← Back to plate</a>
        <h1 className="font-display font-semibold text-on-surface text-headline-md md:text-display-lg mb-9">Acquire the plate</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-11">
          <div className="card-bb p-6">
            <div className="pb-6 border-b border-outline-variant mb-6">
              <div className="font-body text-label-sm text-on-surface-variant mb-2">AVAILABLE</div>
              <h3 className="font-display font-semibold text-on-surface text-headline-sm mt-3 mb-1.5">{design.title}</h3>
              <div className="font-body text-on-surface-variant text-body-md">{design.style}</div>
              <div className="font-body text-on-surface-variant/60 text-label-sm mt-2.5">№ {design.n} / 001 · {design.placement}</div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                ["Plate price", fmtUsdt(price)],
                ["Platform fee (3%)", fmtUsdt(platformFee)],
                ["Artist receives", price != null ? fmtUsdt(price - platformFee) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between font-body text-body-md">
                  <span className="text-on-surface-variant text-label-md">{k}</span>
                  <span className="text-on-surface text-label-md">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 border-t border-outline-variant mt-1.5">
                <span className="font-body text-body-md">You pay</span>
                <span className="font-display font-semibold text-on-surface text-headline-md">{fmtUsdt(price)}</span>
              </div>
            </div>
          </div>

          <div className="card-bb p-6">
            <h3 className="font-display font-semibold text-on-surface text-headline-sm mb-5">Payment</h3>

            {!isConnected ? (
              <div className="py-8">
                <p className="text-on-surface-variant text-body-md mb-5">Connect your wallet to acquire this plate.</p>
                <button className="btn-primary" onClick={login}>Connect & Sign in</button>
              </div>
            ) : onWrongChain ? (
              <div className="py-6">
                <p className="text-on-surface-variant text-body-md mb-4">Please switch to BSC Testnet to continue.</p>
                <button
                  className="btn-primary"
                  onClick={() => switchChain({ chainId: CHAIN_ID })}
                >
                  Switch to BSC
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <label className="label-bb">Connected wallet</label>
                  <div className="input-bb opacity-70 text-label-sm">
                    {address?.slice(0, 6)}…{address?.slice(-4)}
                  </div>
                </div>

                {(voucherError || writeError || confirmError) && (
                  <div className="p-3 bg-error-container/30 border border-error/30 text-error text-body-md font-body mb-4 rounded-lg">
                    {voucherError || (writeError ? writeError.message.split("\n")[0] : null) || confirmError}
                  </div>
                )}

                <label className="flex gap-2.5 items-start mt-1.5 mb-6 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-primary-container" />
                  <span className="text-on-surface-variant text-label-sm">I understand this plate is one-of-one. On purchase it is permanently retired from the gallery.</span>
                </label>

                {voucherData && !usdtApproved && !approveConfirmed && (
                  <div className="p-2.5 px-3.5 bg-primary-container/10 border border-primary-container/30 mb-4 text-label-sm font-body rounded-lg">
                    Step 1 of 2: Approve USDT spending, then mint
                  </div>
                )}
                <button
                  className="btn-primary w-full"
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
                <p className="font-body text-on-surface-variant/60 text-label-sm text-center mt-3.5 tracking-[0.06em]">
                  Payment processed on BSC via USDT (BEP-20)
                </p>
                <button
                  className="btn-secondary w-full mt-3"
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
  );
}

export default function CheckoutFlow({ design }: { design: DesignData }) {
  return (
    <WalletProvider>
      <CheckoutFlowInner design={design} />
    </WalletProvider>
  );
}
