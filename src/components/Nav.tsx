import { useState } from "react";
import PrivyNavButton from "./PrivyNavButton";

interface NavProps {
  currentPath?: string;
}

const links: [string, string][] = [
  ["/market", "Gallery"],
  ["/artists", "Artists"],
  ["/booking", "Book"],
  ["/wallet", "My Wallet"],
  ["/artist/portal", "Artist Portal"],
  ["/", "How it works"],
];

export default function Nav({ currentPath = "/" }: NavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="nav">
        <div className="wrap nav__inner">
          <a className="brand" href="/">
            <span className="brand__mark">INKNOIR</span>
            <span className="brand__tag">1 / 1 · House of Ink</span>
          </a>
          <div className="nav__links">
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={"nav__link" + (currentPath === href ? " is-active" : "")}
              >
                {label}
              </a>
            ))}
            <PrivyNavButton />
          </div>
          <button className="nav__burger" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? "✕" : "≡"}
          </button>
        </div>
      </nav>
      <div className={"mmenu" + (open ? " is-on" : "")}>
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
