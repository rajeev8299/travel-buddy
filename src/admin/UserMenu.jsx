import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronUp, ExternalLink, LogOut, UserRound } from "lucide-react";
import { api } from "../lib/api";
import { ROLE_LABEL } from "./roles";
import { mediaUrl } from "./blog/shared";

/** Name menu at the foot of the sidebar: My profile, View public profile, Sign out.
 *  Menu-button pattern: Escape or a click outside closes it and returns focus. */
export default function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const loadMe = useCallback(() => {
    api.get("/editorial/me").then(setMe).catch(() => setMe(null));
  }, []);
  useEffect(() => {
    loadMe();
    window.addEventListener("profile:updated", loadMe);
    return () => window.removeEventListener("profile:updated", loadMe);
  }, [loadMe]);

  useEffect(() => {
    if (!open) return undefined;
    menuRef.current?.querySelector("[role=menuitem]")?.focus();
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "mousedown" && (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target))) return;
      setOpen(false);
      if (e.type === "keydown") buttonRef.current?.focus();
    };
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  const onMenuKey = (e) => {
    const items = [...menuRef.current.querySelectorAll("[role=menuitem]")];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") items[(i + 1) % items.length]?.focus();
    else if (e.key === "ArrowUp") items[(i - 1 + items.length) % items.length]?.focus();
    else return;
    e.preventDefault();
  };

  const name = me?.profile?.displayName || user.full_name || user.fullName || user.email;
  const photo = me?.profile?.avatarUrl;
  return (
    <div className="admin-usermenu">
      {open && (
        <ul ref={menuRef} className="admin-usermenu__list" role="menu" aria-label="Your account" onKeyDown={onMenuKey}>
          <li role="none">
            <Link role="menuitem" to="/admin/blog/profile" onClick={() => setOpen(false)}>
              <UserRound size={15} aria-hidden="true" /> My profile
            </Link>
          </li>
          {me?.publicUrl && (
            <li role="none">
              <a role="menuitem" href={me.publicUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                <ExternalLink size={15} aria-hidden="true" /> View public profile
              </a>
            </li>
          )}
          <li role="none">
            <button type="button" role="menuitem" onClick={onSignOut}>
              <LogOut size={15} aria-hidden="true" /> Sign out
            </button>
          </li>
        </ul>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="admin-usermenu__button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {photo ? (
          <img src={mediaUrl(photo)} alt="" style={{ objectPosition: me.profile.avatarPos || "50% 50%" }} />
        ) : (
          <span className="admin-usermenu__initials" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        )}
        <span className="admin-usermenu__who">
          <strong>{name}</strong>
          <span>{ROLE_LABEL[user.role]}</span>
        </span>
        <ChevronUp size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
