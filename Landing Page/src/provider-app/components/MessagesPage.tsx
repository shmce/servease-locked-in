import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Search, Send, Paperclip, ExternalLink, Star } from 'lucide-react';
import {
  getStoredProviderAccessToken,
  listProviderConversationMessages,
  listProviderBookings,
  listProviderConversations,
  sendProviderConversationMessage,
  uploadProviderMessageAttachment,
  type ConversationMessage,
  type ConversationSummary,
} from '../../services/serveaseProviderApi';
import { enrichProviderConversationsWithBookings } from '../utils/providerConversationEnrichment';
import { pickQueryItemId } from '../utils/providerDeeplinks';

// Styles object for reusability across provider dashboard pages.
const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))',
    padding: '20px',
    overflow: 'hidden',
  } as React.CSSProperties,
  maxWidthContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    height: '100%',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #F3F4F6',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  searchBar: {
    padding: '12px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties,
  filterTab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
    color: '#6B7280',
  } as React.CSSProperties,
  filterTabActive: {
    color: '#00BF63',
    borderBottomColor: '#00BF63',
  } as React.CSSProperties,
  conversationItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
  messageInput: {
    padding: '12px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    minHeight: '44px',
    maxHeight: '120px',
  } as React.CSSProperties,
  button: {
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '44px',
  } as React.CSSProperties,
  primaryButton: {
    backgroundColor: '#00BF63',
    color: 'white',
  } as React.CSSProperties,
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#00BF63',
    border: '1px solid #00BF63',
  } as React.CSSProperties,
  iconButton: {
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
  quickReplyButton: {
    flexShrink: 0,
    backgroundColor: '#F3F4F6',
    border: 'none',
    borderRadius: '999px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  } as React.CSSProperties,
  bookingCard: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#D1FAE5',
    color: '#059669',
  } as React.CSSProperties,
};

interface Message {
  id: number | string;
  text?: string;
  imageUri?: string;
  attachmentName?: string | null;
  timestamp: string;
  sender: 'provider' | 'customer';
}

interface Booking {
  serviceType: string;
  date: string;
  time: string;
  status: string;
}

interface Conversation {
  id: number | string;
  bookingId?: string | null;
  name: string;
  avatar: string;
  photo?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  rating?: number;
  bookingRef?: string;
  category: 'booking' | 'general';
  booking?: Booking;
  messages: Message[];
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function initialsFromId(value: string | null): string {
  if (!value) {
    return 'SE';
  }

  return value.slice(0, 2).toUpperCase();
}

function toUiMessage(message: ConversationMessage): Message {
  return {
    id: message.id,
    text: message.content,
    imageUri: message.attachment?.fileUrl ?? undefined,
    attachmentName: message.attachment?.fileName ?? null,
    timestamp: formatTimestamp(message.createdAt),
    sender: message.senderRole,
  };
}

function toUiConversation(conversation: ConversationSummary): Conversation {
  const customerLabel = conversation.customerId
    ? `Customer ${conversation.customerId.slice(0, 8)}`
    : 'ServEase Customer';

  return {
    id: conversation.id,
    bookingId: conversation.bookingId,
    name: customerLabel,
    avatar: initialsFromId(conversation.customerId),
    lastMessage: conversation.lastMessageAt
      ? 'Open conversation'
      : 'No messages yet',
    timestamp: formatTimestamp(conversation.lastMessageAt || conversation.createdAt),
    unread: 0,
    bookingRef: conversation.bookingId
      ? `Booking ${conversation.bookingId.slice(0, 8)}`
      : undefined,
    category: conversation.bookingId ? 'booking' : 'general',
    booking: conversation.bookingId
      ? {
          serviceType: 'Service Booking',
          date: 'Booking details unavailable',
          time: '',
          status: 'Open',
        }
      : undefined,
    messages: [],
  };
}

export function MessagesPage() {
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<number | string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'booking' | 'general'>('all');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  // Dynamically measured available height (viewport minus sticky header)
  const [contentHeight, setContentHeight] = useState<string>('calc(100vh - 65px)');

  const messageThreadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent body/page-level scrolling while on Messages page
  useEffect(() => {
    // First reset scroll position to prevent stuck UI when navigating from scrolled pages
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Then apply no-scroll after the position reset has taken effect
    const prevOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevDocOverflow;
    };
  }, []);

  // Measure actual header height and keep height responsive on resize
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('header');
      const headerH = header ? header.getBoundingClientRect().height : 65;
      setContentHeight(`${window.innerHeight - headerH}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
      const token = getStoredProviderAccessToken();

      if (!token) {
        setConversations([]);
        setSelectedConversation(null);
        return;
      }

      setIsLoadingConversations(true);
      setMessageError(null);

      try {
        const [gatewayConversations, providerBookings] = await Promise.all([
          listProviderConversations(token),
          listProviderBookings(token).catch(() => []),
        ]);
        const mappedConversations = enrichProviderConversationsWithBookings(
          gatewayConversations.map(toUiConversation),
          providerBookings,
        );
        setConversations(mappedConversations);
        setSelectedConversation((current) =>
          pickQueryItemId(
            location.search,
            'conversationId',
            mappedConversations.map((conversation) => conversation.id),
            current && mappedConversations.some((conversation) => conversation.id === current)
              ? current
              : mappedConversations[0]?.id ?? null,
          ),
        );
      } catch (error) {
        setMessageError(
          error instanceof Error ? error.message : 'Unable to load conversations.',
        );
      } finally {
        setIsLoadingConversations(false);
      }
    };

    void loadConversations();
    const intervalId = window.setInterval(loadConversations, 30000);

    return () => window.clearInterval(intervalId);
  }, [location.search]);

  useEffect(() => {
    const loadMessages = async () => {
      const token = getStoredProviderAccessToken();

      if (!token || selectedConversation === null || typeof selectedConversation === 'number') {
        return;
      }

      setIsLoadingMessages(true);
      setMessageError(null);

      try {
        const messages = await listProviderConversationMessages(
          token,
          selectedConversation,
        );
        const mappedMessages = messages.map(toUiMessage);
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  messages: mappedMessages,
                  lastMessage: mappedMessages.at(-1)?.text || conv.lastMessage,
                }
              : conv,
          ),
        );
      } catch (error) {
        setMessageError(
          error instanceof Error ? error.message : 'Unable to load messages.',
        );
      } finally {
        setIsLoadingMessages(false);
      }
    };

    void loadMessages();
    const intervalId =
      selectedConversation !== null && typeof selectedConversation === 'string'
        ? window.setInterval(loadMessages, 10000)
        : null;

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [selectedConversation]);

  const quickReplies = ['On my way', 'Running 5 mins late', 'Completed'];

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterTab === 'all' ||
      (filterTab === 'booking' && conv.category === 'booking') ||
      (filterTab === 'general' && conv.category === 'general');
    return matchesSearch && matchesFilter;
  });

  const activeConversation = conversations.find((c) => c.id === selectedConversation);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageThreadRef.current) {
      messageThreadRef.current.scrollTop = messageThreadRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  // Get current timestamp
  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedConversation !== null) {
      const content = messageText.trim();
      const token = getStoredProviderAccessToken();
      let newMessage: Message = {
        id: Date.now(),
        text: content,
        timestamp: getCurrentTimestamp(),
        sender: 'provider',
      };

      if (token && typeof selectedConversation === 'string') {
        setIsSendingMessage(true);
        setMessageError(null);

        try {
          const sentMessage = await sendProviderConversationMessage(
            token,
            selectedConversation,
            content,
          );
          newMessage = toUiMessage(sentMessage);
        } catch (error) {
          setMessageError(
            error instanceof Error ? error.message : 'Unable to send message.',
          );
          setIsSendingMessage(false);
          return;
        } finally {
          setIsSendingMessage(false);
        }
      }

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, messages: [...conv.messages, newMessage], lastMessage: content }
            : conv
        )
      );

      setMessageText('');
    }
  };

  const handleQuickReply = (reply: string) => {
    // Populate the input field with the quick reply text
    setMessageText(reply);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a JPG, JPEG, or PNG image.');
      return;
    }

    const token = getStoredProviderAccessToken();
    if (!token || selectedConversation === null || typeof selectedConversation !== 'string') {
      setMessageError('Sign in and select a live conversation before sending attachments.');
      e.target.value = '';
      return;
    }

    setIsSendingMessage(true);
    setMessageError(null);

    void uploadProviderMessageAttachment(token, file)
      .then((upload) =>
        sendProviderConversationMessage(token, selectedConversation, 'Sent an image', {
          fileUrl: upload.publicUrl,
          fileName: file.name,
          mimeType: file.type,
          storagePath: upload.path,
          fileSize: upload.size,
        }),
      )
      .then((sentMessage) => {
        const newMessage = toUiMessage(sentMessage);
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === selectedConversation
              ? { ...conv, messages: [...conv.messages, newMessage], lastMessage: 'Sent an image' }
              : conv
          )
        );
      })
      .catch((error) => {
        setMessageError(
          error instanceof Error ? error.message : 'Unable to send attachment.',
        );
      })
      .finally(() => {
        setIsSendingMessage(false);
      });

    e.target.value = '';
  };

  return (
    <div style={{ ...styles.container, height: contentHeight }}>
      <div style={styles.maxWidthContainer}>
        {/* Messages Card - 2 Column Layout */}
        <div style={styles.card}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            height: '100%',
            overflow: 'hidden',
          }}>
            
            {/* ============= LEFT PANEL: Conversations List ============= */}
            <div style={{
              borderRight: '1px solid #F3F4F6',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              }}>
              
              {/* Search Bar */}
              <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
                {messageError && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '10px',
                      color: '#991B1B',
                      fontSize: '13px',
                      marginBottom: '12px',
                      padding: '10px 12px',
                    }}
                  >
                    {messageError}
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <Search
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#9CA3AF',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      ...styles.searchBar,
                      paddingLeft: '40px',
                    }}
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid #F3F4F6',
                padding: '0 20px',
                flexShrink: 0,
              }}>
                <button
                  onClick={() => setFilterTab('all')}
                  style={{
                    ...styles.filterTab,
                    ...(filterTab === 'all' ? styles.filterTabActive : {}),
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTab('booking')}
                  style={{
                    ...styles.filterTab,
                    ...(filterTab === 'booking' ? styles.filterTabActive : {}),
                  }}
                >
                  Booking Related
                </button>
                <button
                  onClick={() => setFilterTab('general')}
                  style={{
                    ...styles.filterTab,
                    ...(filterTab === 'general' ? styles.filterTabActive : {}),
                  }}
                >
                  General
                </button>
              </div>

              {/* Conversations List — independently scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {isLoadingConversations && (
                  <div style={{ color: '#6B7280', fontSize: '14px', padding: '16px 20px' }}>
                    Loading conversations...
                  </div>
                )}
                {!isLoadingConversations && filteredConversations.length === 0 && (
                  <div style={{ color: '#6B7280', fontSize: '14px', padding: '16px 20px' }}>
                    No conversations found.
                  </div>
                )}
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    style={{
                      ...styles.conversationItem,
                      backgroundColor: selectedConversation === conv.id ? '#F0FDF4' : 'transparent',
                      borderLeft: selectedConversation === conv.id ? '3px solid #00BF63' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedConversation !== conv.id) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedConversation !== conv.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: '#00BF63',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          flexShrink: 0,
                        }}
                      >
                        {conv.avatar}
                      </div>

                      {/* Conversation Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                            {conv.name}
                          </h3>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{conv.timestamp}</span>
                        </div>
                        
                        {/* Rating and Booking Reference */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {conv.rating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Star style={{ width: '12px', height: '12px', color: '#F59E0B', fill: '#F59E0B' }} />
                              <span style={{ fontSize: '11px', color: '#6B7280' }}>{conv.rating}</span>
                            </div>
                          )}
                          {conv.bookingRef && (
                            <>
                              <span style={{ fontSize: '11px', color: '#D1D5DB' }}>•</span>
                              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>{conv.bookingRef}</span>
                            </>
                          )}
                        </div>
                        
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#6B7280',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {conv.lastMessage}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {conv.unread > 0 && (
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#00BF63',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {conv.unread}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============= RIGHT PANEL: Chat Conversation Area ============= */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {activeConversation ? (
                <>
                  {/* Header Section - Customer Info — fixed */}
                  <div
                    style={{
                      padding: '20px 24px',
                      borderBottom: '1px solid #F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'white',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: '#00BF63',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px',
                        }}
                      >
                        {activeConversation.avatar}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                          {activeConversation.name}
                        </h3>
                        {activeConversation.rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Star style={{ width: '14px', height: '14px', color: '#F59E0B', fill: '#F59E0B' }} />
                            <span style={{ fontSize: '13px', color: '#6B7280' }}>{activeConversation.rating} rating</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <button
                      style={{
                        ...styles.button,
                        ...styles.secondaryButton,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0FDF4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <ExternalLink style={{ width: '16px', height: '16px' }} />
                      <span>View Profile</span>
                    </button>
                  </div>

                  {/* Related Booking Card (if applicable) — fixed */}
                  {activeConversation.booking && (
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#FAFAFA', flexShrink: 0 }}>
                      <div style={styles.bookingCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                              {activeConversation.booking.serviceType}
                            </p>
                            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                              {activeConversation.booking.date} at {activeConversation.booking.time}
                            </p>
                          </div>
                          <span style={styles.badge}>{activeConversation.booking.status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages Thread — only this section scrolls */}
                  <div
                    style={{
                      flex: 1,
                      padding: '24px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      backgroundColor: '#F9FAFB',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      minHeight: 0,
                    }}
                    ref={messageThreadRef}
                  >
                    {isLoadingMessages && (
                      <div style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
                        Loading messages...
                      </div>
                    )}
                    {activeConversation.messages.map((message) => {
                      const isProvider = message.sender === 'provider';
                      return (
                        <div
                          key={message.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isProvider ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              backgroundColor: isProvider ? '#00BF63' : 'white',
                              color: isProvider ? 'white' : '#111827',
                              boxShadow: isProvider ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            {message.imageUri ? (
                              <img 
                                src={message.imageUri} 
                                alt={message.attachmentName ?? 'Attachment'}
                                style={{ 
                                  maxWidth: '200px', 
                                  maxHeight: '150px', 
                                  borderRadius: '8px', 
                                  display: 'block' 
                                }} 
                              />
                            ) : (
                              <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.5' }}>{message.text}</p>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#9CA3AF',
                              marginTop: '4px',
                              textAlign: isProvider ? 'right' : 'left',
                            }}
                          >
                            {message.timestamp}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Replies — fixed */}
                  <div style={{ 
                    padding: '12px 24px 0', 
                    backgroundColor: 'white',
                    borderTop: '1px solid #F3F4F6',
                    flexShrink: 0,
                  }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
                      {quickReplies.map((reply) => (
                        <QuickReplyButton key={reply} label={reply} onClick={() => handleQuickReply(reply)} />
                      ))}
                    </div>
                  </div>

                  {/* Message Input Area — fixed */}
                  <div style={{ padding: '12px 24px 20px', backgroundColor: 'white', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                      <button
                        style={styles.iconButton}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        onClick={handleAttachmentClick}
                      >
                        <Paperclip style={{ width: '20px', height: '20px', color: '#6B7280' }} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg, image/jpg, image/png"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void handleSendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        rows={1}
                        style={{
                          ...styles.messageInput,
                          flex: 1,
                        }}
                      />
                      <button
                        disabled={isSendingMessage}
                        onClick={() => void handleSendMessage()}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          opacity: isSendingMessage ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00BF63')}
                      >
                        <Send style={{ width: '18px', height: '18px' }} />
                        <span>{isSendingMessage ? 'Sending...' : 'Send'}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9CA3AF',
                  }}
                >
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Reply Button Component with isolated hover state
function QuickReplyButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...styles.quickReplyButton,
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
