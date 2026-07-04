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
      <div>
        <section className="py-[72px] pb-[100px]">
          <div className="max-w-[700px] mx-auto px-5 md:px-16">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#E60023] text-white flex items-center justify-center font-sora font-bold text-lg mx-auto mb-6">✓</div>
              <div className="font-sora font-semibold text-xs tracking-[0.2em] uppercase text-[#E60023] mb-4">Plate claimed</div>
              <h1 className="font-playfair font-semibold text-[#1B1C18] text-[48px]">It&apos;s yours alone.</h1>
              <p className="text-[#5A5B55] text-[15px] mt-[18px] mx-auto mb-9 max-w-[46ch]">
                &ldquo;{design.title}&rdquo; has left the gallery and been retired. The certificate of authenticity is now in your collection.
              </p>
            </div>
            <div className="flex gap-3 mt-7 justify-center flex-wrap">
              <a href="/wallet" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-sora font-semibold text-base transition-all bg-[#E60023] text-white hover:bg-[#C4001F]">View collection</a>
              <a href="/market" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-sora font-semibold text-base transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]">Back to gallery</a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="py-8 pb-[90px]">
        <div className="max-w-[980px] mx-auto px-5 md:px-16">
          <a href={`/design/${design.id}`} className="inline-flex items-center gap-2 text-[#5A5B55] hover:text-[#1B1C18] mb-8 font-sora text-sm">← Back to plate</a>
          <h1 className="font-playfair font-semibold text-[#1B1C18] text-[clamp(34px,5vw,56px)] mb-9">Acquire the plate</h1>
          <div className="grid grid-cols-2 gap-11">
            <div>
              <div className="flex gap-[18px] pb-6 border-b border-[#E8E3D8] mb-6">
                <div>
                  <div className="font-sora text-[#5A5B55] text-[11px] mb-2">AVAILABLE</div>
                  <h3 className="font-playfair font-semibold text-[#1B1C18] text-[26px] mt-3 mb-1.5">{design.title}</h3>
                  <div className="font-sora text-[#5A5B55] text-xs">{design.style}</div>
                  <div className="font-sora text-[#5A5B55]/60 text-[11px] mt-2.5">№ {design.n} / 001 · {design.placement}</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  ["Plate price", fmtUsdt(price)],
                  ["Platform fee (3%)", fmtUsdt(platformFee)],
                  ["Artist receives", price != null ? fmtUsdt(price - platformFee) : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between font-sora text-sm">
                    <span className="font-sora text-[#5A5B55] text-[13px]">{k}</span>
                    <span className="font-sora text-[13px]">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t border-[#E8E3D8] mt-1.5">
                  <span className="font-sora text-sm">You pay</span>
                  <span className="font-playfair font-semibold text-[#1B1C18] text-[30px]">{fmtUsdt(price)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-playfair font-semibold text-[#1B1C18] text-2xl mb-5">Payment</h3>

              {!isConnected ? (
                <div className="py-8">
                  <p className="text-[#5A5B55] text-sm mb-5">Connect your wallet to acquire this plate.</p>
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-sora font-semibold text-base transition-all bg-[#E60023] text-white hover:bg-[#C4001F]" onClick={login}>Connect & Sign in</button>
                </div>
              ) : onWrongChain ? (
                <div className="py-6">
                  <p className="text-[#5A5B55] text-sm mb-4">Please switch to BSC Testnet to continue.</p>
                  <button
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-sora font-semibold text-base transition-all bg-[#E60023] text-white hover:bg-[#C4001F]"
                    onClick={() => switchChain({ chainId: CHAIN_ID })}
                  >
                    Switch to BSC
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <label className="block font-sora font-semibold text-sm text-[#5A5B55] mb-2">Connected wallet</label>
                    <div className="w-full bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-sm px-4 py-3 rounded-lg outline-none focus:border-[#E60023] transition-colors font-sora px-3.5 py-2.5 opacity-70 text-xs">
                      {address?.slice(0, 6)}…{address?.slice(-4)}
                    </div>
                  </div>

                  {(voucherError || writeError || confirmError) && (
                    <div className="p-3 bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#D32F2F] text-sm font-sora mb-4">
                      {voucherError || (writeError ? writeError.message.split("\n")[0] : null) || confirmError}
                    </div>
                  )}

                  <label className="flex gap-2.5 items-start mt-1.5 mb-6 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5" />
                    <span className="text-[#5A5B55] text-[12.5px]">I understand this plate is one-of-one. On purchase it is permanently retired from the gallery.</span>
                  </label>

                  {voucherData && !usdtApproved && !approveConfirmed && (
                    <div className="p-2.5 px-3.5 bg-[#E60023]/10 border border-[#E60023]/30 mb-4 text-[12.5px] font-sora">
                      Step 1 of 2: Approve USDT spending, then mint
                    </div>
                  )}
                  <button
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-sora font-semibold text-base transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40 disabled:cursor-not-allowed w-full"
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
                  <p className="font-sora text-[#5A5B55]/60 text-[10.5px] text-center mt-3.5 tracking-[0.06em]">
                    Payment processed on BSC via USDT (BEP-20)
                  </p>
                  <button
                    className="w-full mt-3 px-0 py-2.5 bg-transparent border border-[#E8E3D8] text-[#5A5B55] text-[13px] cursor-pointer font-sora hover:border-[#D4CFC4] transition-colors"
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
