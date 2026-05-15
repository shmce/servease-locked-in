
    margin: 0,
    lineHeight: 1.5,
  },
  bubbleTextCustomer: {
    fontSize: 14,
    fontWeight: 400,
    color: '#000000',
    margin: 0,
    lineHeight: 1.5,
  },
  bubbleImage: {
    maxWidth: 200,
    maxHeight: 150,
    borderRadius: 8,
    objectFit: 'cover',
    display: 'block',
  },
  timestampProvider: {
    fontSize: 11,
    fontWeight: 400,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  timestampCustomer: {
    fontSize: 11,
    fontWeight: 400,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'left',
  },

  // ── Quick replies
  quickRepliesWrapper: {
    flexShrink: 0,
    padding: '8px 0',
  },
  quickRepliesScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    padding: '0 20px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  } as CSSProperties,
  quickReplyBtn: {
    flexShrink: 0,
    backgroundColor: '#F3F4F6',
    border: 'none',
    borderRadius: 999,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'background-color 0.15s',
  },

  // ── Input area
  inputArea: {
    flexShrink: 0,
    padding: '8px 20px 28px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    marginBottom: 4,
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 8,
    transition: 'color 0.15s',
    flexShrink: 0,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: '11px 16px',
    display: 'flex',
    alignItems: 'center',
    minHeight: 44,
  },
  textarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: 14,
    fontWeight: 400,
    color: '#000000',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: `${LINE_HEIGHT}px`,
    overflowY: 'hidden',
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#00BF63',
    border: 'none',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.15s',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChatConversation() {
  const [messages, setMessages]       = useState<Message[]>(INITIAL_MESSAGES);
  const [messageText, setMessageText] = useState('');
  const [sendHover, setSendHover]     = useState(false);
  const [viewHover, setViewHover]     = useState(false);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadRef    = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: Date.now().toString(), timestamp: nowTime() },
    ]);
  }, []);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, MAX_H);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_H ? 'auto' : 'hidden';
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageText(e.target.value);
      resizeTextarea();
    },
    [resizeTextarea],
  );

  const handleSend = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    addMessage({ text: trimmed, sender: 'provider' });
    setMessageText('');
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.overflowY = 'hidden';
      }
    });
  }, [messageText, addMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleQuickReply = useCallback(
    (reply: string) => addMessage({ text: reply, sender: 'provider' }),
    [addMessage],
  );

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        addMessage({ imageUri: ev.target?.result as string, sender: 'provider' });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [addMessage],
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={S.header}>
        {/* Back row */}
        <div style={S.headerTopRow}>
          <button style={S.backBtn} aria-label="Go back">
            <ArrowLeft size={22} />
          </button>
          <p style={S.headerTitle}>Chat</p>
        </div>

        {/* Customer info card */}
        <div style={S.customerCard}>
          <img src={CUSTOMER.photo} alt={CUSTOMER.name} style={S.avatar} />
          <p style={S.customerName}>{CUSTOMER.name}</p>
          <button
            style={{
              ...S.viewProfileBtn,
              backgroundColor: viewHover ? '#F9FAFB' : 'transparent',
            }}
            onMouseEnter={() => setViewHover(true)}
            onMouseLeave={() => setViewHover(false)}
          >
            View Profile
          </button>
        </div>
      </div>

      {/* ── Related Booking Card ─────────────────────────────────────────────── */}
      <div style={S.bookingWrapper}>
        <div style={S.bookingCard}>
          <div style={S.bookingInfo}>
            <p style={S.bookingService}>{BOOKING.serviceType}</p>
            <p style={S.bookingDateTime}>{BOOKING.date} at {BOOKING.time}</p>
          </div>
          <span style={S.badge}>{BOOKING.status}</span>
        </div>
      </div>

      {/* ── Message Thread ───────────────────────────────────────────────────── */}
      <div ref={threadRef} style={S.thread}>
        {messages.map((msg) => {
          const isProvider = msg.sender === 'provider';
          return (
            <div key={msg.id} style={isProvider ? S.msgRowProvider : S.msgRowCustomer}>
              <div style={isProvider ? S.bubbleProvider : S.bubbleCustomer}>
                {msg.imageUri ? (
                  <img src={msg.imageUri} alt="Attachment" style={S.bubbleImage} />
                ) : (
                  <p style={isProvider ? S.bubbleTextProvider : S.bubbleTextCustomer}>
                    {msg.text}
                  </p>
                )}
              </div>
              <span style={isProvider ? S.timestampProvider : S.timestampCustomer}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Quick Replies ────────────────────────────────────────────────────── */}
      <div style={S.quickRepliesWrapper}>
        <div style={S.quickRepliesScroll}>
          {QUICK_REPLIES.map((reply) => (
            <QuickReplyButton key={reply} label={reply} onClick={() => handleQuickReply(reply)} />
          ))}
        </div>
      </div>

      {/* ── Message Input ────────────────────────────────────────────────────── */}
      <div style={S.inputArea}>
        {/* Attachment */}
        <button style={S.attachBtn} onClick={handleAttachmentClick} aria-label="Attach photo">
          <Paperclip size={22} />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Textarea */}
        <div style={S.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            style={{ ...S.textarea, height: LINE_HEIGHT }}
          />
        </div>

        {/* Send */}
        <button
          style={{
            ...S.sendBtn,
            backgroundColor: sendHover ? '#00A856' : '#00BF63',
          }}
          onClick={handleSend}
          onMouseEnter={() => setSendHover(true)}
          onMouseLeave={() => setSendHover(false)}
          aria-label="Send message"
        >
          <Send size={18} color="#ffffff" />
        </button>
      </div>

    </div>
  );
}

// ─── QuickReplyButton (isolated hover state) ──────────────────────────────────
function QuickReplyButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...S.quickReplyBtn,
        backgroundColor: hovered ? '#E5E7EB' : '#F3F4F6',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  );
}