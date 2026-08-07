globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                    */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead } from "../../chunks/astro/server_B1Q-Dpks.mjs";
import { j as jsxRuntimeExports, $ as $$Base } from "../../chunks/jsx-runtime_6SzGatPE.mjs";
import { r as reactExports } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { f as filterMessage } from "../../chunks/schema_CheqUxFK.mjs";
import { g as getArtistSession } from "../../chunks/auth_CBLJGIc-.mjs";
import { i as isAdminAuthed } from "../../chunks/auth_DbftzjD7.mjs";
const ChatContext = reactExports.createContext(null);
function ChatProvider({ children }) {
  const [conversations, setConversations] = reactExports.useState([]);
  const [messages, setMessages] = reactExports.useState({});
  const [activeConversation, setActiveConversation] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const fetchConversations = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
      }
    } catch (err) {
      console.error("fetchConversations failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchMessages = reactExports.useCallback(async (conversationId) => {
    try {
      const res = await fetch(`/api/chat/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => ({
          ...prev,
          [conversationId]: data.messages ?? []
        }));
        setConversations(
          (prev) => prev.map((c) => c.id === conversationId ? { ...c, unread: 0 } : c)
        );
      }
    } catch (err) {
      console.error(`fetchMessages failed for ${conversationId}:`, err);
    }
  }, []);
  const sendMessage = reactExports.useCallback(async (conversationId, text) => {
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, text })
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || "Failed to send message" };
      }
      const msg = {
        id: data.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderRole: data.senderRole,
        text: data.text,
        flagged: Boolean(data.flagged),
        flagReason: data.flagReason ?? null,
        createdAt: data.createdAt
      };
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...prev[conversationId] ?? [], msg]
      }));
      setConversations(
        (prev) => prev.map(
          (c) => c.id === conversationId ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt } : c
        )
      );
      return { ok: true, message: msg };
    } catch (err) {
      console.error("sendMessage failed:", err);
      return { ok: false, error: "Network error" };
    }
  }, []);
  const addMessage = reactExports.useCallback((conversationId, msg) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...prev[conversationId] ?? [], msg]
    }));
    setConversations(
      (prev) => prev.map(
        (c) => c.id === conversationId ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, unread: msg.senderRole !== "client" ? c.unread : c.unread + 1 } : c
      )
    );
  }, []);
  const markRead = reactExports.useCallback((conversationId) => {
    setConversations(
      (prev) => prev.map((c) => c.id === conversationId ? { ...c, unread: 0 } : c)
    );
  }, []);
  const flagConversation = reactExports.useCallback((conversationId, reason) => {
    setConversations(
      (prev) => prev.map((c) => c.id === conversationId ? { ...c, status: "flagged" } : c)
    );
  }, []);
  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatContext.Provider, { value: {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    addMessage,
    markRead,
    flagConversation,
    unreadCount,
    loading
  }, children });
}
function useChat() {
  return reactExports.useContext(ChatContext);
}
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};
const LucideContext = reactExports.createContext({});
const useLucideContext = () => reactExports.useContext(LucideContext);
const Icon = reactExports.forwardRef(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return reactExports.createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size ?? contextSize ?? defaultAttributes.width,
        height: size ?? contextSize ?? defaultAttributes.height,
        stroke: color ?? contextColor,
        strokeWidth: calculatedStrokeWidth,
        className: mergeClasses("lucide", contextClass, className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => reactExports.createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const createLucideIcon = (iconName, iconNode) => {
  const Component = reactExports.forwardRef(
    ({ className, ...props }, ref) => reactExports.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$2);
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode$1);
/**
 * @license lucide-react v1.24.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
function ChatBox({ userId, senderRole, conversationId, onSendBooking }) {
  const [text, setText] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const scrollRef = reactExports.useRef(null);
  const { messages, fetchMessages, sendMessage } = useChat();
  const msgList = messages[conversationId] ?? [];
  reactExports.useEffect(() => {
    if (conversationId && fetchMessages) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);
  reactExports.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgList.length]);
  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const check = filterMessage(trimmed);
    if (!check.clean) {
      setError("Message flagged: " + (check.reason || "Anti-bypass rule matched"));
      return;
    }
    setError("");
    setSending(true);
    if (sendMessage) {
      const result = await sendMessage(conversationId, trimmed);
      if (!result.ok) {
        setError(result.error || "Failed to send message");
      } else {
        setText("");
      }
    }
    setSending(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full border rounded-xl overflow-hidden bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5 text-gray-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: "Chat" })
      ] }),
      senderRole === "artist" && onSendBooking && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSendBooking, className: "px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "+ Send Booking" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-4 space-y-3", children: msgList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-gray-400 text-sm mt-8", children: "No messages yet." }) : msgList.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.senderId === userId ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: msg.text }),
      msg.bookingId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 p-1 rounded text-xs bg-opacity-50", children: [
        "Booking #",
        msg.bookingId.slice(0, 8)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] mt-1 opacity-60", children: new Date(msg.createdAt).toLocaleTimeString() })
    ] }) }, msg.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t p-3", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2 p-2 bg-red-50 text-red-700 text-xs rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
        error
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: text, onChange: (e) => {
          setText(e.target.value);
          setError("");
        }, onKeyDown: (e) => e.key === "Enter" && handleSend(), placeholder: "Type a message...", className: "flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none", maxLength: 2e3 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSend, disabled: sending || !text.trim(), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4" }) })
      ] })
    ] })
  ] });
}
function InboxInner() {
  const [activeConv, setActiveConv] = reactExports.useState(null);
  const { conversations, fetchConversations, loading } = useChat();
  reactExports.useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[calc(100vh-120px)] gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-80 shrink-0 border rounded-xl overflow-hidden bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b bg-gray-50 font-semibold text-sm", children: "Inbox" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: loading && conversations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-xs text-gray-400 text-center", children: "Loading conversations..." }) : conversations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-xs text-gray-400 text-center", children: "No active conversations." }) : conversations.map((conv) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveConv(conv.id),
          className: `w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${activeConv === conv.id ? "bg-blue-50" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: conv.clientName || conv.artistName || conv.id }),
              conv.unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded-full", children: conv.unread })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 truncate", children: conv.lastMessage || conv.designId || "No messages" })
          ]
        },
        conv.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: activeConv ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChatBox, { userId: "artist", senderRole: "artist", conversationId: activeConv }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full text-gray-400 text-sm border rounded-xl bg-white", children: "Select a conversation" }) })
  ] });
}
function InboxView() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InboxInner, {}) });
}
const $$Astro = createAstro();
const prerender = false;
const $$Inbox = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Inbox;
  const env = Astro2.locals.runtime.env;
  const cookieHeader = Astro2.request.headers.get("cookie") ?? "";
  const artistSession = await getArtistSession(cookieHeader, env.SESSION);
  const isAdmin = await isAdminAuthed(cookieHeader, env.SESSION);
  if (!artistSession && !isAdmin) {
    return Astro2.redirect("/artist/portal");
  }
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Inbox" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-4xl mx-auto px-4 py-8"> ${renderComponent($$result2, "InboxView", InboxView, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/InboxView", "client:component-export": "default" })} </main> ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/artist/inbox.astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/artist/inbox.astro";
const $$url = "/artist/inbox";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Inbox,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
