import { useState } from "react";
import AdminArtistModal from "./AdminArtistModal";

interface Artist {
  id: string;
  name: string;
  wallet_address: string | null;
  // Additional fields for modal
  handle?: string | null;
  city?: string | null;
  style?: string | null;
  years?: number | null;
  booked?: string | null;
  rate?: number | null;
  bio?: string | null;
  email?: string | null;
}

interface AdminArtistTableProps {
  artists: Artist[];
}

const thBase = "font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 px-4 py-3 text-left border-b border-outline-variant bg-surface-container-low whitespace-nowrap";
const tdBase = "px-4 py-3 border-b border-outline-variant/40 text-body-md font-body";

export default function AdminArtistTable({ artists: initialArtists }: AdminArtistTableProps) {
  const [artists, setArtists] = useState<Artist[]>(initialArtists);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function handleEdit(artist: Artist) {
    setSelectedArtist(artist);
    setModalOpen(true);
  }

  function handleSave(updatedArtist: Artist) {
    setArtists((prev) =>
      prev.map((a) => (a.id === updatedArtist.id ? updatedArtist : a))
    );
  }

  async function handleDelete(artist: Artist) {
    const confirmed = window.confirm(
      `Delete artist "${artist.name}"? This will hide their profile and block new bookings.`
    );
    if (!confirmed) return;

    setDeleting(artist.id);
    try {
      const res = await fetch("/api/admin/delete-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: artist.id }),
      });

      if (res.ok) {
        // Remove from local state
        setArtists((prev) => prev.filter((a) => a.id !== artist.id));
      } else {
        const data = await res.json();
        alert("Delete failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border border-outline-variant/40 border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className={thBase}>Artist</th>
              <th className={thBase}>ID</th>
              <th className={thBase}>Current wallet</th>
              <th className={thBase}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((a) => (
              <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className={`${tdBase} font-medium text-on-surface`}>{a.name}</td>
                <td className={`${tdBase} text-label-sm text-on-surface-variant/60 font-mono`}>{a.id}</td>
                <td className={`${tdBase} text-label-sm font-mono max-w-[200px] truncate`}>
                  {a.wallet_address ? a.wallet_address : <span className="text-on-surface-variant/40">not set</span>}
                </td>
                <td className={tdBase}>
                  <div className="flex gap-2 items-center">
                    {/* Wallet update form */}
                    <form method="POST" action="/api/admin/update-artist-wallet"
                      className="flex gap-2 items-center">
                      <input type="hidden" name="artistId" value={a.id} />
                      <input type="text" name="walletAddress" className="input-bb text-label-sm font-mono w-[200px] py-1.5"
                        placeholder="0x…"
                        defaultValue={a.wallet_address ?? ""} />
                      <button type="submit" className="btn-secondary text-label-sm py-1.5 px-4">
                        Save
                      </button>
                    </form>

                    {/* Edit button */}
                    <button
                      onClick={() => handleEdit(a)}
                      className="btn-secondary text-label-sm py-1.5 px-4"
                    >
                      Edit
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(a)}
                      disabled={deleting === a.id}
                      className="px-4 py-1.5 bg-error text-white font-body text-label-sm font-semibold rounded-full transition-all hover:bg-error/80 disabled:opacity-40 cursor-pointer"
                    >
                      {deleting === a.id ? "..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AdminArtistModal
        artist={selectedArtist}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedArtist(null);
        }}
        onSave={handleSave}
      />
    </>
  );
}
