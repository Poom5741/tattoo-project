/**
 * ResaleButton — placeholder while on-chain resale is disabled.
 *
 * On-chain resale depends on transactions that aren't testable yet at
 * the soft launch. The button used to wire into wagmi/RainbowKit and
 * call /api/resale/create; both are stubbed. The component now renders
 * a static "coming soon" notice. See wayfinder ticket 03.
 */

interface ResaleButtonProps {
  designId: string;
  tokenId: number;
  appId: string;
}

export default function ResaleButton(_props: ResaleButtonProps) {
  return (
    <div
      className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-sora text-sm border border-[#E8E3D8] text-[#5A5B55] bg-transparent"
      style={{ fontSize: 13 }}
      aria-disabled="true"
    >
      Resale coming soon
    </div>
  );
}
