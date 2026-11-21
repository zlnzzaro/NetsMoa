import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Search,
  Plus,
  ArrowUpRight,
  LayoutGrid,
  Bookmark,
  Send,
  MessageCircle,
  Users,
  GraduationCap,
  Bell,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Clock,
  Target,
  Code2,
  Palette,
  Lightbulb,
  Video,
  Shapes,
  SlidersHorizontal,
  ShieldCheck,
  LogOut,
  Menu,
  ExternalLink,
  Lock,
  CheckCheck,
  Sparkles,
  Trash2,
  Pencil,
  BookOpen,
  HeartHandshake,
  LoaderCircle,
} from "lucide-react";
import { api, demo, supabase, schoolDomain } from "./api";
import {
  categories,
  statusLabels,
  dayLeft,
  isClosed,
  safeUrl,
  type State,
  type Post,
  type PostInput,
  type Application,
  type Profile,
} from "./model";
import "./styles.css";
type View = "explore" | "saved" | "applications" | "manage" | "chats";
const empty: State = {
  profiles: [],
  posts: [],
  applications: [],
  messages: [],
};
const catIcons = [LayoutGrid, Code2, Palette, Lightbulb, Video, Shapes];
const field = (f: FormData, k: string) => String(f.get(k) || "").trim();
const dateText = (d: string) =>
  new Date(d).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
function App() {
  const [state, setState] = useState<State>(empty),
    [user, setUser] = useState<string | null>(demo ? "me" : null),
    [view, setView] = useState<View>("explore");
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [loadError, setLoadError] = useState("");
  const [category, setCategory] = useState("전체"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("latest"),
    [openOnly, setOpenOnly] = useState(true),
    [roleFilter, setRoleFilter] = useState("");
  const [detail, setDetail] = useState<string | null>(null),
    [formPost, setFormPost] = useState<Post | null | undefined>(undefined),
    [applyPost, setApplyPost] = useState<Post | null>(null),
    [login, setLogin] = useState(false),
    [profile, setProfile] = useState(false),
    [guide, setGuide] = useState(false),
    [notifications, setNotifications] = useState(false),
    [mobile, setMobile] = useState(false),
    [chatId, setChatId] = useState<string | null>(null),
    [link, setLink] = useState<string | null | undefined>(undefined);
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("moa-saved") || "[]");
    } catch {
      return [];
    }
  });
  const chatBottom = useRef<HTMLDivElement>(null);
  const refresh = async () => {
    try {
      setState(await api.load());
      setLoadError("");
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
    if (demo) {
      const update = () => void refresh();
      window.addEventListener("moa-change", update);
      window.addEventListener("storage", update);
      return () => {
        window.removeEventListener("moa-change", update);
        window.removeEventListener("storage", update);
      };
    }
    const { data } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user.id || null);
      setTimeout(() => void refresh(), 0);
    });
    const channel = supabase!
      .channel("moa-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      data.subscription.unsubscribe();
      void supabase!.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4200);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const me = state.profiles.find((p) => p.id === user);
  const myApps = state.applications.filter((a) => a.applicant_id === user);
  const incoming = state.applications.filter((a) =>
    state.posts.some((p) => p.id === a.post_id && p.author_id === user),
  );
  const allApps = state.applications.filter(
    (a) =>
      a.applicant_id === user ||
      state.posts.some((p) => p.id === a.post_id && p.author_id === user),
  );
  const unread = state.messages.filter(
    (m) =>
      allApps.some((a) => a.id === m.application_id) &&
      m.sender_id !== user &&
      !m.read_at,
  );
  const selectedChat = allApps.find((a) => a.id === chatId);
  const selectedPost = state.posts.find((p) => p.id === detail);
  useEffect(() => {
    if (view === "chats" && chatId && user) {
      void api.markRead(user, chatId).catch((e) => setToast(e.message));
      chatBottom.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [view, chatId, user, state.messages.length]);
  const run = async (fn: () => Promise<unknown>, message?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      await refresh();
      if (message) setToast(message);
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const requireUser = (fn: () => void) => (user ? fn() : setLogin(true));
  const navigate = (v: View) => {
    setView(v);
    setMobile(false);
    setNotifications(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const bookmark = (id: string) =>
    setSaved((old) => {
      const next = old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id];
      localStorage.setItem("moa-saved", JSON.stringify(next));
      return next;
    });
  const openChat = (id: string) => {
    setChatId(id);
    setDetail(null);
    navigate("chats");
  };
  const openTeam = (p: Post) =>
    void run(async () => setLink(await api.teamLink(user!, p.id)));
  let filtered = state.posts.filter(
    (p) =>
      (view !== "saved" || saved.includes(p.id)) &&
      (category === "전체" || p.category === category) &&
      (!openOnly || !isClosed(p)) &&
      (!roleFilter || p.roles.some((r) => r.name.includes(roleFilter))) &&
      `${p.title} ${p.competition} ${p.roles.map((r) => r.name).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  filtered = [...filtered].sort((a, b) =>
    sort === "deadline"
      ? a.deadline.localeCompare(b.deadline)
      : b.created_at.localeCompare(a.created_at),
  );
  const browse = view === "explore" || view === "saved";
  const navItems: {
    id: View;
    label: string;
    icon: typeof Search;
    count?: number;
  }[] = [
    { id: "explore", label: "팀 찾기", icon: LayoutGrid },
    { id: "saved", label: "관심 모집", icon: Bookmark, count: saved.length },
    {
      id: "applications",
      label: "내 지원 현황",
      icon: Send,
      count: myApps.length,
    },
    { id: "manage", label: "내 모집 관리", icon: Users },
    {
      id: "chats",
      label: "면담 채팅",
      icon: MessageCircle,
      count: unread.length,
    },
  ];
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="메뉴 닫기"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("explore")}
          aria-label="모아 홈"
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          <strong>
            모아<span>moa</span>
          </strong>
        </button>
        <div className="campus">
          <span className="campus-icon">
            <GraduationCap size={19} />
          </span>
          <div>
            <strong>경북대학교</strong>
            <small>우리 학교, 우리 팀</small>
          </div>
          <ShieldCheck size={16} />
        </div>
        <p className="nav-caption">MY CAMPUS</p>
        <nav>
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
              {!!count && <b>{count}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">
              <HeartHandshake size={23} />
            </span>
            <strong>
              좋은 팀의 시작은,
              <br />
              서로를 알아가는 것부터.
            </strong>
            <p>모아와 첫 도전을 준비해요.</p>
            <button onClick={() => setGuide(true)}>
              모아 이용 가이드 <ChevronRight size={15} />
            </button>
          </div>
          <button className="sidebar-guide" onClick={() => setGuide(true)}>
            <BookOpen size={17} /> 이용 안내
          </button>
          <div className="sidebar-foot">
            함께 모여, 더 멀리.<span>© 2026 MOA</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="icon-button mobile-toggle"
              aria-label="메뉴 열기"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span>우리 학교에서 시작하는 새로운 도전</span>
            <span className="tiny-pill">KNU CAMPUS</span>
          </div>
          <div className="topbar-actions">
            {demo && <span className="demo-badge">체험 모드</span>}
            <div className="notification-wrap">
              <button
                className="icon-button"
                aria-label="알림"
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={20} />
                {unread.length > 0 && <i />}
              </button>
              {notifications && (
                <div className="notification-panel">
                  <strong>새로운 소식</strong>
                  {unread.length ? (
                    unread
                      .slice(-5)
                      .reverse()
                      .map((m) => (
                        <button
                          key={m.id}
                          onClick={() => openChat(m.application_id)}
                        >
                          <MessageCircle size={18} />
                          <span>
                            {m.body}
                            <small>면담 채팅에서 확인하기</small>
                          </span>
                        </button>
                      ))
                  ) : (
                    <p>
                      새로운 알림이 없어요.
                      <br />
                      지원 결과와 메시지를 여기서 알려드릴게요.
                    </p>
                  )}
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            {user ? (
              <button
                className="profile-trigger"
                onClick={() => setProfile(true)}
              >
                <span className="avatar">
                  {me?.nickname.slice(0, 1) || "나"}
                </span>
                <span>{me?.nickname || "프로필 설정"}</span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <button
                className="button small primary"
                onClick={() => setLogin(true)}
              >
                학교 이메일로 시작하기
              </button>
            )}
          </div>
        </header>
        <main>
          {browse ? (
            <>
              {view === "explore" ? (
                <section className="hero">
                  <div className="hero-content">
                    <span className="hero-eyebrow">
                      <span /> 같은 학교, 새로운 가능성
                    </span>
                    <h1>
                      혼자였던 아이디어가,
                      <br />
                      <em>우리의 도전</em>이 되는 곳.
                    </h1>
                    <p>
                      나와 목표가 맞는 우리 학교 팀원을 만나보세요.
                      <br />
                      공모전의 시작부터 마지막 순간까지, 함께.
                    </p>
                    <button
                      className="button dark"
                      onClick={() => requireUser(() => setFormPost(null))}
                    >
                      <Plus size={17} /> 팀원 모집하기
                    </button>
                  </div>
                  <div className="hero-art" aria-hidden="true">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <div className="floating-label label-top">
                      <span className="mini-icon">
                        <Code2 size={20} />
                      </span>{" "}
                      서로 다른 강점이 모여
                    </div>
                    <div className="art-grid">
                      <div className="art-tile art-green">
                        <span className="asterisk">✳</span>
                      </div>
                      <div className="art-tile art-yellow">
                        <Lightbulb size={49} strokeWidth={1.6} />
                      </div>
                      <div className="art-tile art-white">
                        <Code2 size={48} strokeWidth={1.7} />
                      </div>
                      <div className="art-tile art-sage">
                        <Users size={49} strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="floating-label label-bottom">
                      <span className="check-circle">
                        <Check size={15} />
                      </span>{" "}
                      하나의 팀으로 연결되는 순간
                    </div>
                    <span className="spark spark-one">✧</span>
                    <span className="spark spark-two">✦</span>
                  </div>
                </section>
              ) : (
                <div className="page-heading">
                  <span className="eyebrow">MY COLLECTION</span>
                  <h1>관심 모집</h1>
                  <p>마음이 가는 도전들을 한곳에 모았어요.</p>
                </div>
              )}
              <section className="explore-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      {view === "saved"
                        ? "저장한 모집"
                        : "함께할 팀을 찾아보세요"}{" "}
                      <span>
                        {view === "saved"
                          ? saved.length
                          : state.posts.filter((p) => !isClosed(p)).length}
                      </span>
                    </h2>
                    <p>
                      {view === "saved"
                        ? "나에게 맞는 팀을 천천히 살펴보세요."
                        : "서로의 가능성을 더해, 더 큰 도전으로."}
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setGuide(true)}
                  >
                    어떤 팀이 나와 맞을까요? <BookOpen size={16} />
                  </button>
                </div>
                <div className="discovery-toolbar">
                  <div
                    className="category-tabs"
                    role="tablist"
                    aria-label="공모전 분야"
                  >
                    {categories.map((c, i) => {
                      const Icon = catIcons[i];
                      return (
                        <button
                          role="tab"
                          aria-selected={category === c}
                          className={category === c ? "selected" : ""}
                          key={c}
                          onClick={() => setCategory(c)}
                        >
                          <Icon size={17} />
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div className="search-field">
                    <Search size={18} />
                    <input
                      aria-label="팀 또는 공모전 검색"
                      placeholder="어떤 도전을 찾고 있나요?"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        aria-label="검색 지우기"
                        onClick={() => setSearch("")}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="filter-row">
                  <div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={openOnly}
                        onChange={(e) => setOpenOnly(e.target.checked)}
                      />{" "}
                      모집 중인 팀만 보기
                    </label>
                    <span className="filter-divider" />
                    <div className="select-wrap role-select">
                      <SlidersHorizontal size={15} />
                      <select
                        aria-label="모집 역할 필터"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="">모집 역할 전체</option>
                        <option>프론트엔드</option>
                        <option>백엔드</option>
                        <option value="디자인">디자인</option>
                        <option value="기획">기획</option>
                        <option value="데이터">데이터 분석</option>
                        <option value="영상">영상 편집</option>
                      </select>
                      <ChevronDown size={13} />
                    </div>
                  </div>
                  <div className="select-wrap">
                    <select
                      aria-label="정렬"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="latest">최신순</option>
                      <option value="deadline">마감 임박순</option>
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
                {loading ? (
                  <div className="empty-state">
                    <LoaderCircle className="spin" />
                    <h3>함께할 팀을 불러오고 있어요</h3>
                  </div>
                ) : loadError ? (
                  <Empty
                    icon={<CloudError />}
                    title="모집 정보를 불러오지 못했어요"
                    text={loadError}
                    action={
                      <button
                        className="button primary"
                        onClick={() => void refresh()}
                      >
                        다시 시도
                      </button>
                    }
                  />
                ) : filtered.length ? (
                  <div className="post-grid">
                    {filtered.map((p) => (
                      <PostCard
                        key={p.id}
                        post={p}
                        saved={saved.includes(p.id)}
                        author={state.profiles.find(
                          (u) => u.id === p.author_id,
                        )}
                        onSave={() => bookmark(p.id)}
                        onOpen={() => setDetail(p.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={<Search />}
                    title={
                      view === "saved"
                        ? "아직 저장한 모집이 없어요"
                        : "조건에 맞는 팀이 아직 없어요"
                    }
                    text="다른 분야를 살펴보거나, 직접 팀원을 모집해 보세요."
                    action={
                      <button
                        className="button outline"
                        onClick={() => {
                          setCategory("전체");
                          setSearch("");
                          setRoleFilter("");
                          setOpenOnly(false);
                        }}
                      >
                        필터 초기화
                      </button>
                    }
                  />
                )}
              </section>
              <div className="trust-strip">
                <ShieldCheck size={19} />
                <p>
                  같은 학교라서 더 든든하게.
                  <span>
                    학교 이메일 인증과 1:1 면담으로, 서로에게 맞는 팀을 만나요.
                  </span>
                </p>
                <span className="trust-domain">@{schoolDomain}</span>
              </div>
            </>
          ) : view === "chats" ? (
            <>
              <PageHeading
                eyebrow="TEAM CONVERSATIONS"
                title="면담 채팅"
                text="함께할 동료와 목표, 일정, 기대를 나눠보세요."
              />
              {allApps.length ? (
                <div className="chat-layout">
                  <div className="chat-list">
                    <div className="chat-list-heading">
                      전체 대화 <span>{allApps.length}</span>
                    </div>
                    {allApps.map((a) => {
                      const p = state.posts.find((p) => p.id === a.post_id)!;
                      const other = state.profiles.find(
                        (u) =>
                          u.id ===
                          (a.applicant_id === user
                            ? p.author_id
                            : a.applicant_id),
                      );
                      const last = state.messages
                        .filter((m) => m.application_id === a.id)
                        .at(-1);
                      const count = unread.filter(
                        (m) => m.application_id === a.id,
                      ).length;
                      return (
                        <button
                          className={`chat-preview ${chatId === a.id ? "active" : ""}`}
                          key={a.id}
                          onClick={() => setChatId(a.id)}
                        >
                          <span className="avatar">
                            {other?.nickname.slice(0, 1)}
                          </span>
                          <div>
                            <strong>
                              {other?.nickname}
                              <small>{statusLabels[a.status]}</small>
                            </strong>
                            <p>{p.title}</p>
                            <span>{last?.body || "대화를 시작해 보세요."}</span>
                          </div>
                          {count > 0 && <b>{count}</b>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="chat-room">
                    {selectedChat ? (
                      <>
                        <div className="chat-header">
                          <div>
                            <strong>
                              {
                                state.profiles.find(
                                  (p) =>
                                    p.id ===
                                    (selectedChat.applicant_id === user
                                      ? state.posts.find(
                                          (p) => p.id === selectedChat.post_id,
                                        )?.author_id
                                      : selectedChat.applicant_id),
                                )?.nickname
                              }
                            </strong>
                            <span>
                              {
                                state.posts.find(
                                  (p) => p.id === selectedChat.post_id,
                                )?.title
                              }
                            </span>
                          </div>
                          {selectedChat.status === "ACCEPTED" ? (
                            <button
                              className="button small primary"
                              onClick={() =>
                                openTeam(
                                  state.posts.find(
                                    (p) => p.id === selectedChat.post_id,
                                  )!,
                                )
                              }
                            >
                              <ExternalLink size={15} />팀 오픈채팅
                            </button>
                          ) : (
                            <span className="status-badge">
                              {statusLabels[selectedChat.status]}
                            </span>
                          )}
                        </div>
                        <div className="chat-notice">
                          <ShieldCheck size={14} /> 개인 연락처를 공유하기 전,
                          충분히 대화해 주세요.
                        </div>
                        <div className="chat-messages">
                          {state.messages
                            .filter((m) => m.application_id === chatId)
                            .map((m) =>
                              m.sender_id === null ? (
                                <div className="system-message" key={m.id}>
                                  {m.body}
                                </div>
                              ) : (
                                <div
                                  key={m.id}
                                  className={`message ${m.sender_id === user ? "mine" : ""}`}
                                >
                                  <p>{m.body}</p>
                                  <small>
                                    {new Date(m.created_at).toLocaleTimeString(
                                      "ko-KR",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                    {m.sender_id === user && m.read_at && (
                                      <CheckCheck size={13} />
                                    )}
                                  </small>
                                </div>
                              ),
                            )}
                          <div ref={chatBottom} />
                        </div>
                        <form
                          className="message-compose"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const f = e.currentTarget;
                            const body = field(new FormData(f), "message");
                            void run(async () => {
                              await api.send(user!, chatId!, body);
                              f.reset();
                            });
                          }}
                        >
                          <input
                            name="message"
                            aria-label="메시지"
                            placeholder={
                              ["REJECTED", "CANCELED"].includes(
                                selectedChat.status,
                              )
                                ? "종료된 면담입니다"
                                : "서로를 알아가는 첫 인사를 건네보세요."
                            }
                            maxLength={2000}
                            required
                            disabled={["REJECTED", "CANCELED"].includes(
                              selectedChat.status,
                            )}
                          />
                          <button
                            className="button primary"
                            aria-label="메시지 보내기"
                            disabled={
                              busy ||
                              ["REJECTED", "CANCELED"].includes(
                                selectedChat.status,
                              )
                            }
                          >
                            <Send size={18} />
                          </button>
                        </form>
                      </>
                    ) : (
                      <Empty
                        icon={<MessageCircle />}
                        title="대화를 선택해 주세요"
                        text="지원 한 건마다 1:1 면담 공간이 열려요."
                      />
                    )}
                  </div>
                </div>
              ) : (
                <Empty
                  icon={<MessageCircle />}
                  title="아직 시작된 면담이 없어요"
                  text="관심 있는 팀에 지원하면 1:1 대화가 시작돼요."
                  action={
                    <button
                      className="button primary"
                      onClick={() => navigate("explore")}
                    >
                      팀 둘러보기
                    </button>
                  }
                />
              )}
            </>
          ) : view === "applications" ? (
            <>
              <PageHeading
                eyebrow="MY APPLICATIONS"
                title="내 지원 현황"
                text="새로운 도전을 향한 나의 여정을 확인해요."
              />
              <div className="summary-grid">
                {[
                  ["전체 지원", myApps.length],
                  [
                    "면담 중",
                    myApps.filter((a) =>
                      ["PENDING", "CHATTING"].includes(a.status),
                    ).length,
                  ],
                  [
                    "합류 확정",
                    myApps.filter((a) => a.status === "ACCEPTED").length,
                  ],
                ].map(([label, n]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>
                      {n}
                      <small>팀</small>
                    </strong>
                  </div>
                ))}
              </div>
              {myApps.length ? (
                <div className="application-list">
                  {myApps.map((a) => {
                    const p = state.posts.find((p) => p.id === a.post_id)!;
                    return (
                      <div className="application-card" key={a.id}>
                        <div className={`application-icon cover-${p.color}`}>
                          <Send />
                        </div>
                        <div className="application-info">
                          <span className={`status-badge status-${a.status}`}>
                            {statusLabels[a.status]}
                          </span>
                          <button
                            className="plain-title"
                            onClick={() => setDetail(p.id)}
                          >
                            {p.title}
                          </button>
                          <p>
                            {p.roles.find((r) => r.id === a.role_id)?.name} ·{" "}
                            {dateText(a.created_at)} 지원
                          </p>
                        </div>
                        <div className="application-actions">
                          {a.status === "ACCEPTED" && (
                            <button
                              className="button primary small"
                              onClick={() => openTeam(p)}
                            >
                              팀 오픈채팅 <ExternalLink size={14} />
                            </button>
                          )}
                          <button
                            className="button outline small"
                            onClick={() => openChat(a.id)}
                          >
                            <MessageCircle size={15} /> 면담 보기
                          </button>
                          {["PENDING", "CHATTING"].includes(a.status) && (
                            <button
                              className="text-button muted"
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "신청을 취소할까요? 같은 모집글에 다시 지원할 수 없어요.",
                                  )
                                )
                                  void run(
                                    () => api.decide(user!, a.id, "CANCELED"),
                                    "신청을 취소했어요.",
                                  );
                              }}
                            >
                              지원 취소
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  icon={<Send />}
                  title="첫 번째 도전을 시작해 볼까요?"
                  text="마음에 드는 팀을 찾아 나의 강점을 알려주세요."
                  action={
                    <button
                      className="button primary"
                      onClick={() => navigate("explore")}
                    >
                      팀 둘러보기
                    </button>
                  }
                />
              )}
            </>
          ) : (
            <>
              <PageHeading
                eyebrow="MY RECRUITMENT"
                title="내 모집 관리"
                text="지원자를 알아보고, 함께할 팀원을 만나세요."
                action={
                  <button
                    className="button primary"
                    onClick={() => requireUser(() => setFormPost(null))}
                  >
                    <Plus size={18} /> 모집글 작성
                  </button>
                }
              />
              {state.posts.filter((p) => p.author_id === user).length ? (
                state.posts
                  .filter((p) => p.author_id === user)
                  .map((p) => (
                    <section className="manage-post" key={p.id}>
                      <div className="manage-heading">
                        <div>
                          <span
                            className={`status-badge ${isClosed(p) ? "" : "status-ACCEPTED"}`}
                          >
                            {isClosed(p) ? "모집 마감" : "모집 중"}
                          </span>
                          <button
                            className="plain-title"
                            onClick={() => setDetail(p.id)}
                          >
                            {p.title}
                          </button>
                          <p>
                            {p.roles
                              .map((r) => `${r.name} ${r.filled}/${r.capacity}`)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="manage-tools">
                          <button
                            className="icon-button"
                            aria-label="모집글 수정"
                            disabled={
                              busy || incoming.some((a) => a.post_id === p.id)
                            }
                            onClick={() => setFormPost(p)}
                            title="지원자가 생긴 후에는 내용을 수정할 수 없어요"
                          >
                            <Pencil size={17} />
                          </button>
                          {!isClosed(p) && (
                            <button
                              className="button outline small"
                              disabled={busy}
                              onClick={() => {
                                if (window.confirm("이 모집을 마감할까요?"))
                                  void run(
                                    () => api.managePost(user!, p.id, "close"),
                                    "모집을 마감했어요.",
                                  );
                              }}
                            >
                              모집 마감
                            </button>
                          )}
                          <button
                            className="icon-button danger"
                            aria-label="모집글 삭제"
                            disabled={busy}
                            onClick={() => {
                              if (window.confirm("모집글을 삭제할까요?"))
                                void run(
                                  () => api.managePost(user!, p.id, "delete"),
                                  "모집글을 삭제했어요.",
                                );
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                      {incoming.filter((a) => a.post_id === p.id).length ? (
                        incoming
                          .filter((a) => a.post_id === p.id)
                          .map((a) => (
                            <Applicant
                              key={a.id}
                              app={a}
                              profile={state.profiles.find(
                                (u) => u.id === a.applicant_id,
                              )}
                              role={
                                p.roles.find((r) => r.id === a.role_id)?.name ||
                                ""
                              }
                              busy={busy}
                              onChat={() => openChat(a.id)}
                              onDecide={(status) => {
                                if (
                                  window.confirm(
                                    status === "ACCEPTED"
                                      ? "팀원으로 수락할까요? 오픈채팅 주소가 공개되며 수락을 취소할 수 없어요."
                                      : "이 지원자의 선발을 종료할까요?",
                                  )
                                )
                                  void run(
                                    () => api.decide(user!, a.id, status),
                                    status === "ACCEPTED"
                                      ? "새로운 팀원이 합류했어요!"
                                      : "선발을 종료했어요.",
                                  );
                              }}
                            />
                          ))
                      ) : (
                        <div className="manage-empty">
                          <Users size={25} />
                          <p>
                            아직 지원자가 없어요. 함께할 팀원을 기다리고 있어요.
                          </p>
                        </div>
                      )}
                    </section>
                  ))
              ) : (
                <Empty
                  icon={<Users />}
                  title="내 아이디어에 동료를 더해보세요"
                  text="필요한 역할과 목표를 알려주면, 나에게 맞는 팀원이 찾아와요."
                  action={
                    <button
                      className="button primary"
                      onClick={() => requireUser(() => setFormPost(null))}
                    >
                      <Plus size={17} /> 첫 모집글 작성하기
                    </button>
                  }
                />
              )}
            </>
          )}
          <footer className="main-footer">
            <span>
              모아 <span>우리의 가능성이 모이는 곳</span>
            </span>
            <button onClick={() => setGuide(true)}>이용 가이드</button>
            {demo && (
              <span className="demo-note">
                예시 모집글과 이 브라우저에 저장되는 체험 데이터입니다.
              </span>
            )}
          </footer>
        </main>
      </div>
      {selectedPost && (
        <Modal title="모집 상세" onClose={() => setDetail(null)} wide>
          <div className={`detail-cover cover-${selectedPost.color}`}>
            <span>{selectedPost.competition}</span>
            <strong>
              {selectedPost.category === "개발"
                ? "< BUILD TOGETHER />"
                : selectedPost.category === "디자인"
                  ? "MAKE SOMETHING NEW."
                  : "BETTER, TOGETHER."}
            </strong>
          </div>
          <div className="detail-content">
            <div className="detail-meta">
              <span className="category-label">{selectedPost.category}</span>
              <span className="status-badge">
                {isClosed(selectedPost)
                  ? "모집 마감"
                  : `D-${Math.max(0, dayLeft(selectedPost.deadline))}`}
              </span>
              <button
                className={`icon-button ${saved.includes(selectedPost.id) ? "bookmarked" : ""}`}
                aria-label="관심 모집 저장"
                onClick={() => bookmark(selectedPost.id)}
              >
                <Bookmark
                  size={20}
                  fill={
                    saved.includes(selectedPost.id) ? "currentColor" : "none"
                  }
                />
              </button>
            </div>
            <h2>{selectedPost.title}</h2>
            <p className="detail-author">
              {
                state.profiles.find((p) => p.id === selectedPost.author_id)
                  ?.nickname
              }{" "}
              ·{" "}
              {
                state.profiles.find((p) => p.id === selectedPost.author_id)
                  ?.department
              }{" "}
              <span>{dateText(selectedPost.created_at)} 작성</span>
            </p>
            <div className="expectations">
              <div>
                <Clock size={19} />
                <span>
                  주간 활동 시간<strong>주 {selectedPost.hours}시간</strong>
                </span>
              </div>
              <div>
                <Target size={19} />
                <span>
                  우리 팀의 목표<strong>{selectedPost.goal}</strong>
                </span>
              </div>
              <div>
                <Users size={19} />
                <span>
                  모집 마감<strong>{dateText(selectedPost.deadline)}</strong>
                </span>
              </div>
            </div>
            <h3>이런 도전을 함께해요</h3>
            <p className="description-text">{selectedPost.description}</p>
            <a
              className="external-link"
              href={safeUrl(selectedPost.competition_url)}
              target="_blank"
              rel="noreferrer"
            >
              공모전 공식 사이트 <ExternalLink size={15} />
            </a>
            <h3>함께할 역할</h3>
            <div className="detail-roles">
              {selectedPost.roles.map((r) => (
                <div key={r.id}>
                  <span>{r.name}</span>
                  <strong>
                    {r.filled}
                    <span> / {r.capacity}명</span>
                  </strong>
                  <span className="status-badge">
                    {r.filled >= r.capacity ? "모집 완료" : "모집 중"}
                  </span>
                </div>
              ))}
            </div>
            <div className="privacy-note">
              <Lock size={17} />
              <span>오픈채팅 주소는 팀 합류가 확정된 후에만 공개돼요.</span>
            </div>
            <div className="detail-bottom">
              {selectedPost.author_id === user ? (
                <button
                  className="button primary"
                  onClick={() => {
                    setDetail(null);
                    navigate("manage");
                  }}
                >
                  지원자 관리하기
                </button>
              ) : myApps.some((a) => a.post_id === selectedPost.id) ? (
                <button
                  className="button primary"
                  onClick={() =>
                    openChat(
                      myApps.find((a) => a.post_id === selectedPost.id)!.id,
                    )
                  }
                >
                  내 지원 · 면담 확인
                </button>
              ) : (
                <button
                  className="button primary"
                  disabled={isClosed(selectedPost)}
                  onClick={() =>
                    requireUser(() => {
                      setApplyPost(selectedPost);
                      setDetail(null);
                    })
                  }
                >
                  {isClosed(selectedPost)
                    ? "마감된 모집이에요"
                    : "이 팀에 지원하기"}{" "}
                  <Send size={17} />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
      {formPost !== undefined && (
        <PostForm
          post={formPost}
          busy={busy}
          onClose={() => setFormPost(undefined)}
          onSave={(data) =>
            void run(async () => {
              await api.savePost(user!, data, formPost?.id);
              setFormPost(undefined);
              navigate("manage");
            }, "모집글을 저장했어요.")
          }
          getLink={async () =>
            formPost ? await api.teamLink(user!, formPost.id) : null
          }
        />
      )}
      {applyPost && (
        <ApplyForm
          post={applyPost}
          busy={busy}
          onClose={() => setApplyPost(null)}
          onSubmit={(data) =>
            void run(async () => {
              const id = await api.apply(user!, data);
              setApplyPost(null);
              openChat(id);
            }, "지원이 완료되었어요. 첫 인사를 나눠보세요!")
          }
        />
      )}
      {login && (
        <Login
          onClose={() => setLogin(false)}
          busy={busy}
          onDemo={() => {
            setUser("me");
            setLogin(false);
          }}
          run={run}
        />
      )}
      {profile && (
        <Modal title="내 프로필" onClose={() => setProfile(false)}>
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run(async () => {
                await api.saveProfile({
                  id: user!,
                  nickname: field(f, "nickname"),
                  department: field(f, "department"),
                  year: Number(f.get("year")),
                  bio: field(f, "bio"),
                });
                setProfile(false);
              }, "프로필을 저장했어요.");
            }}
          >
            <div className="profile-intro">
              <span className="avatar large">
                {me?.nickname.slice(0, 1) || "나"}
              </span>
              <p>
                {demo
                  ? "체험용 프로필입니다."
                  : "학교 인증으로 연결된 나의 프로필"}
              </p>
            </div>
            <label>
              닉네임
              <input
                name="nickname"
                defaultValue={me?.nickname}
                required
                maxLength={20}
              />
            </label>
            <div className="form-row">
              <label>
                학과
                <input
                  name="department"
                  defaultValue={me?.department}
                  required
                  maxLength={50}
                />
              </label>
              <label>
                학년
                <select name="year" defaultValue={me?.year || 1}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}학년
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              한 줄 소개
              <input name="bio" defaultValue={me?.bio} maxLength={100} />
            </label>
            <button className="button primary" disabled={busy}>
              프로필 저장
            </button>
            {demo ? (
              <div className="demo-switch">
                <strong>다른 관점으로 체험하기</strong>
                <p>
                  지원 후 모집자 계정으로 전환하면 면담과 수락을 진행할 수
                  있어요.
                </p>
                <button
                  type="button"
                  className="button outline"
                  onClick={() => {
                    setUser(user === "host" ? "me" : "host");
                    setProfile(false);
                    setChatId(null);
                    navigate(user === "host" ? "applications" : "manage");
                  }}
                >
                  {user === "host"
                    ? "지원자 김모아로 전환"
                    : "모집자 이지원으로 전환"}
                </button>
              </div>
            ) : (
              <button
                className="text-button"
                type="button"
                onClick={() =>
                  void run(async () => {
                    await supabase!.auth.signOut();
                    setUser(null);
                    setState(empty);
                    setProfile(false);
                    setChatId(null);
                    navigate("explore");
                  })
                }
              >
                <LogOut size={16} /> 로그아웃
              </button>
            )}
          </form>
        </Modal>
      )}
      {guide && (
        <Modal title="모아 이용 가이드" onClose={() => setGuide(false)}>
          <div className="guide-content">
            <div className="guide-hero">
              <HeartHandshake size={38} />
              <h2>
                서로를 알아가며,
                <br />
                하나의 팀으로.
              </h2>
            </div>
            {[
              [
                Search,
                "나에게 맞는 팀 찾기",
                "역할, 활동 시간, 목표를 살펴보고 함께하고 싶은 팀을 찾아보세요.",
              ],
              [
                Send,
                "나의 강점을 담아 지원하기",
                "원하는 역할 하나를 선택하고 기술, 경험, 포트폴리오를 알려주세요.",
              ],
              [
                MessageCircle,
                "1:1 면담으로 기대 맞추기",
                "활동 일정과 기대하는 역할을 솔직하게 이야기해요.",
              ],
              [
                ShieldCheck,
                "합류 확정 후 팀 채팅으로",
                "수락된 팀원에게만 오픈채팅 주소가 공개돼요.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Search;
              return (
                <div className="guide-step" key={String(title)}>
                  <I size={22} />
                  <div>
                    <strong>{String(title)}</strong>
                    <p>{String(text)}</p>
                  </div>
                </div>
              );
            })}
            {demo && (
              <div className="notice-box">
                지금은 체험 모드예요. 모든 모집글은 예시이며 데이터는 현재
                브라우저에 저장됩니다. 프로필에서 모집자로 전환해 선발 과정까지
                경험해 보세요. 실제 이메일 발송과 다른 사용자 간 채팅은 Supabase
                연결 후 사용할 수 있어요.
              </div>
            )}
          </div>
        </Modal>
      )}
      {link !== undefined && (
        <Modal title="팀 합류를 축하해요!" onClose={() => setLink(undefined)}>
          <div className="team-link">
            <div className="success-icon">
              <Check size={33} />
            </div>
            <h2>이제, 함께 시작해요.</h2>
            {link ? (
              <>
                <p>
                  확정된 팀원만 볼 수 있는 오픈채팅 주소예요.
                  <br />
                  다른 사람에게 공유하지 말아 주세요.
                </p>
                <a
                  className="button primary"
                  href={safeUrl(link)}
                  target="_blank"
                  rel="noreferrer"
                >
                  팀 오픈채팅 입장 <ExternalLink size={17} />
                </a>
              </>
            ) : (
              <p>
                이 예시 모집글에는 실제 오픈채팅 링크가 없어요.
                <br />
                직접 모집글을 작성하면 입력한 링크가 전달됩니다.
              </p>
            )}
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button aria-label="알림 닫기" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function CloudError() {
  return <Shapes />;
}
function PageHeading({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}
function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
function PostCard({
  post: p,
  saved,
  author,
  onSave,
  onOpen,
}: {
  post: Post;
  saved: boolean;
  author?: Profile;
  onSave: () => void;
  onOpen: () => void;
}) {
  const left = dayLeft(p.deadline);
  return (
    <article className="post-card">
      <div className={`card-cover cover-${p.color}`} onClick={onOpen}>
        <span className={`deadline-badge ${left <= 5 ? "urgent" : ""}`}>
          {isClosed(p) ? "모집 마감" : left === 0 ? "오늘 마감" : `D-${left}`}
        </span>
        <button
          className={`card-bookmark ${saved ? "bookmarked" : ""}`}
          aria-label={saved ? "관심 모집 해제" : "관심 모집 저장"}
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        <div className="cover-copy">
          <small>
            {
              [
                "CAMPUS INNOVATION",
                "DESIGN THE NEXT",
                "DATA FOR CHANGE",
                "OUR CAMPUS STORY",
                "SMALL ACT, BIG IMPACT",
                "LET’S BUILD TOGETHER",
              ][p.color]
            }
          </small>
          <strong>
            {
              [
                "아이디어를 현실로.",
                "새로운 시선을 모아.",
                "데이터에 가치를 더해.",
                "우리의 순간을 담다.",
                "더 나은 내일을 위해.",
                "처음의 도전, 함께.",
              ][p.color]
            }
          </strong>
        </div>
        <div className={`cover-graphic graphic-${p.color}`}>
          {p.color === 0 ? (
            <>
              <div className="code-window">
                <i />
                <i />
                <i />
                <span>&lt;/&gt;</span>
              </div>
              <span className="graphic-star">✦</span>
            </>
          ) : p.color === 1 ? (
            <>
              <span className="design-star">✳</span>
              <span className="design-square" />
            </>
          ) : p.color === 2 ? (
            <>
              <div className="bar-chart">
                <i />
                <i />
                <i />
                <i />
              </div>
              <span className="chart-orbit" />
            </>
          ) : p.color === 3 ? (
            <>
              <div className="play-shape">
                <Video size={45} />
              </div>
              <span className="film-dot" />
            </>
          ) : p.color === 4 ? (
            <>
              <span className="leaf leaf-one" />
              <span className="leaf leaf-two" />
              <span className="leaf-stem" />
            </>
          ) : (
            <>
              <span className="hack-symbol">{`{ }`}</span>
              <span className="hack-spark">✦</span>
            </>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="card-category">
          <span>{p.category}</span>
          <small>{isClosed(p) ? "모집 종료" : "팀원 모집 중"}</small>
        </div>
        <button className="card-title" onClick={onOpen}>
          {p.title}
        </button>
        <p className="competition-name">{p.competition}</p>
        <div className="role-chips">
          {p.roles.map((r) => (
            <span className={r.filled >= r.capacity ? "filled" : ""} key={r.id}>
              {r.name}
              <b>
                {r.filled}/{r.capacity}
              </b>
            </span>
          ))}
        </div>
        <div className="card-expectations">
          <span>
            <Clock size={14} />주 {p.hours}시간
          </span>
          <span>
            <Target size={14} />
            {p.goal}
          </span>
        </div>
        <div className="card-footer">
          <span className="author-info">
            <span className={`mini-avatar avatar-${p.color}`}>
              {author?.nickname.slice(0, 1) || "팀"}
            </span>
            <span>
              {author?.nickname || "팀원"}
              <small>{author?.department}</small>
            </span>
          </span>
          <span className="card-member-count">
            <Users size={14} />
            {p.roles.reduce((n, r) => n + r.filled, 1)}명 참여
          </span>
        </div>
      </div>
    </article>
  );
}
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        tabIndex={-1}
      >
        <div className="modal-header">
          <strong>{title}</strong>
          <button className="icon-button" aria-label="닫기" onClick={onClose}>
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function PostForm({
  post,
  busy,
  onClose,
  onSave,
  getLink,
}: {
  post: Post | null;
  busy: boolean;
  onClose: () => void;
  onSave: (data: PostInput) => void;
  getLink: () => Promise<string | null>;
}) {
  const [roles, setRoles] = useState(
    post?.roles.map((r) => ({ name: r.name, capacity: r.capacity })) || [
      { name: "", capacity: 1 },
    ],
  );
  const [chatLink, setChatLink] = useState("");
  useEffect(() => {
    if (post) void getLink().then((v) => setChatLink(v || ""));
  }, []);
  return (
    <Modal
      title={post ? "모집글 수정" : "새로운 팀원 모집"}
      onClose={onClose}
      wide
    >
      <form
        className="modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSave({
            title: field(f, "title"),
            competition: field(f, "competition"),
            category: field(f, "category"),
            description: field(f, "description"),
            competition_url: field(f, "competition_url"),
            openchat_url: chatLink,
            hours: Number(f.get("hours")),
            goal: field(f, "goal"),
            deadline: field(f, "deadline"),
            roles,
          });
        }}
      >
        <p className="form-intro">
          어떤 도전을 함께하고 싶나요?
          <br />
          <span>팀의 목표와 필요한 역할을 구체적으로 알려주세요.</span>
        </p>
        <label>
          모집글 제목 <b>*</b>
          <input
            name="title"
            placeholder="함께하고 싶은 도전을 한 문장으로 소개해 주세요"
            defaultValue={post?.title}
            required
            minLength={5}
            maxLength={80}
          />
        </label>
        <div className="form-row">
          <label>
            공모전 이름 <b>*</b>
            <input
              name="competition"
              placeholder="공모전 이름"
              defaultValue={post?.competition}
              required
              maxLength={100}
            />
          </label>
          <label>
            분야 <b>*</b>
            <select name="category" defaultValue={post?.category || "개발"}>
              {categories.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          공모전 공식 사이트 <b>*</b>
          <input
            name="competition_url"
            type="url"
            placeholder="https://"
            defaultValue={post?.competition_url}
            required
          />
        </label>
        <label>
          팀 소개 <b>*</b>
          <textarea
            name="description"
            placeholder="아이디어, 현재 팀원, 활동 방식과 함께할 동료에게 기대하는 점을 적어주세요."
            defaultValue={post?.description}
            required
            minLength={20}
            maxLength={5000}
            rows={5}
          />
        </label>
        <div className="field-label">
          모집 역할과 인원 <b>*</b>
        </div>
        <div className="role-editor">
          {roles.map((r, i) => (
            <div key={i}>
              <input
                aria-label={`역할 ${i + 1}`}
                placeholder="예: 프론트엔드"
                value={r.name}
                required
                maxLength={30}
                onChange={(e) =>
                  setRoles(
                    roles.map((x, j) =>
                      i === j ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
              />
              <input
                aria-label={`역할 ${i + 1} 모집 인원`}
                type="number"
                min={1}
                max={10}
                value={r.capacity}
                required
                onChange={(e) =>
                  setRoles(
                    roles.map((x, j) =>
                      i === j ? { ...x, capacity: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
              <span>명</span>
              <button
                type="button"
                className="icon-button"
                aria-label="역할 삭제"
                disabled={roles.length === 1}
                onClick={() => setRoles(roles.filter((_, j) => i !== j))}
              >
                <X size={17} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-button"
            disabled={roles.length >= 5}
            onClick={() => setRoles([...roles, { name: "", capacity: 1 }])}
          >
            <Plus size={16} /> 역할 추가
          </button>
        </div>
        <div className="form-row triple">
          <label>
            주간 활동 시간 <b>*</b>
            <input
              name="hours"
              type="number"
              min={1}
              max={80}
              defaultValue={post?.hours || 5}
              required
            />
          </label>
          <label>
            팀의 목표 <b>*</b>
            <select name="goal" defaultValue={post?.goal || "수상 도전"}>
              <option>수상 도전</option>
              <option>경험·성장</option>
            </select>
          </label>
          <label>
            모집 마감일 <b>*</b>
            <input
              name="deadline"
              type="date"
              defaultValue={post?.deadline}
              min={new Date().toLocaleDateString("en-CA", {
                timeZone: "Asia/Seoul",
              })}
              required
            />
          </label>
        </div>
        <label>
          팀 오픈채팅 주소 <b>*</b>
          <input
            type="url"
            value={chatLink}
            onChange={(e) => setChatLink(e.target.value)}
            placeholder="https://open.kakao.com/o/..."
            required
            pattern="https://open\.kakao\.com/.*"
          />
          <small>
            <Lock size={13} /> 수락된 지원자에게만 공개돼요. 입장 비밀번호도
            설정해 주세요.
          </small>
        </label>
        <button className="button primary" disabled={busy}>
          {busy ? "저장 중..." : post ? "모집글 수정하기" : "모집 시작하기"}
        </button>
      </form>
    </Modal>
  );
}
function ApplyForm({
  post,
  busy,
  onClose,
  onSubmit,
}: {
  post: Post;
  busy: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Application, "id" | "applicant_id" | "status" | "created_at">,
  ) => void;
}) {
  const [role, setRole] = useState("");
  return (
    <Modal title="팀에 지원하기" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSubmit({
            post_id: post.id,
            role_id: role,
            skills: field(f, "skills")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
            portfolio: field(f, "portfolio"),
            experience: field(f, "experience"),
            motivation: field(f, "motivation"),
          });
        }}
      >
        <div className="apply-heading">
          <span>{post.competition}</span>
          <h3>{post.title}</h3>
        </div>
        <div className="field-label">
          어떤 역할로 함께하고 싶나요? <b>*</b>
        </div>
        <div className="role-options">
          {post.roles.map((r) => (
            <button
              type="button"
              key={r.id}
              disabled={r.filled >= r.capacity}
              className={role === r.id ? "selected" : ""}
              onClick={() => setRole(r.id)}
            >
              {r.name}
              <small>
                {r.filled >= r.capacity
                  ? "모집 완료"
                  : `${r.capacity - r.filled}명 모집`}
              </small>
              {role === r.id && <Check size={17} />}
            </button>
          ))}
        </div>
        <label>
          기술 · 강점 <b>*</b>
          <input
            name="skills"
            placeholder="React, Figma, 리서치 (쉼표로 구분)"
            required
            maxLength={150}
          />
        </label>
        <label>
          포트폴리오 링크 <span className="optional">선택</span>
          <input
            name="portfolio"
            type="url"
            placeholder="https://"
            maxLength={500}
          />
        </label>
        <label>
          관련 경험 <b>*</b>
          <textarea
            name="experience"
            placeholder="작은 경험도 좋아요. 팀에 기여할 수 있는 경험을 알려주세요."
            required
            minLength={10}
            maxLength={2000}
            rows={4}
          />
        </label>
        <label>
          함께하고 싶은 이유 <b>*</b>
          <input
            name="motivation"
            placeholder="팀원들에게 전하고 싶은 한마디"
            required
            minLength={5}
            maxLength={200}
          />
        </label>
        <label className="checkbox-label agreement">
          <input type="checkbox" required /> 주 {post.hours}시간 활동과 ‘
          {post.goal}’ 목표를 확인했어요.
        </label>
        <button className="button primary" disabled={!role || busy}>
          {busy ? "지원 중..." : "지원서 보내기"} <Send size={17} />
        </button>
      </form>
    </Modal>
  );
}
function Applicant({
  app: a,
  profile,
  role,
  busy,
  onChat,
  onDecide,
}: {
  app: Application;
  profile?: Profile;
  role: string;
  busy: boolean;
  onChat: () => void;
  onDecide: (status: "ACCEPTED" | "REJECTED") => void;
}) {
  return (
    <div className="applicant">
      <div className="applicant-heading">
        <span className="avatar">{profile?.nickname.slice(0, 1)}</span>
        <div>
          <strong>{profile?.nickname}</strong>
          <p>
            {profile?.department} · {profile?.year}학년 · {role}
          </p>
        </div>
        <span className={`status-badge status-${a.status}`}>
          {statusLabels[a.status]}
        </span>
      </div>
      <div className="skill-tags">
        {a.skills.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
      <p className="applicant-experience">{a.experience}</p>
      <blockquote>“{a.motivation}”</blockquote>
      {safeUrl(a.portfolio) && (
        <a
          className="external-link"
          href={safeUrl(a.portfolio)}
          target="_blank"
          rel="noreferrer"
        >
          포트폴리오 보기 <ExternalLink size={14} />
        </a>
      )}
      <div className="applicant-actions">
        <button className="button outline small" onClick={onChat}>
          <MessageCircle size={16} /> 면담하기
        </button>
        {["PENDING", "CHATTING"].includes(a.status) && (
          <>
            <button
              className="button small"
              disabled={busy}
              onClick={() => onDecide("REJECTED")}
            >
              거절
            </button>
            <button
              className="button primary small"
              disabled={busy}
              onClick={() => onDecide("ACCEPTED")}
            >
              <Check size={16} /> 팀원 수락
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function Login({
  onClose,
  busy,
  onDemo,
  run,
}: {
  onClose: () => void;
  busy: boolean;
  onDemo: () => void;
  run: (fn: () => Promise<unknown>, message?: string) => Promise<void>;
}) {
  const [sent, setSent] = useState(false);
  return (
    <Modal title="학교 이메일로 시작하기" onClose={onClose}>
      <form
        className="modal-form"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const email = field(
            new FormData(e.currentTarget),
            "email",
          ).toLowerCase();
          void run(async () => {
            if (email.split("@")[1] !== schoolDomain)
              throw new Error(`@${schoolDomain} 학교 이메일을 입력해 주세요.`);
            if (demo)
              throw new Error(
                "현재 체험 모드예요. 실제 이메일 인증은 Supabase 연결 후 사용할 수 있어요.",
              );
            const { error } = await supabase!.auth.signInWithOtp({
              email,
              options: { emailRedirectTo: window.location.origin },
            });
            if (error) throw error;
            setSent(true);
          });
        }}
      >
        <div className="guide-hero">
          <GraduationCap size={38} />
          <h2>같은 학교, 더 믿을 수 있는 연결.</h2>
          <p>@{schoolDomain} 이메일로 인증해 주세요.</p>
        </div>
        {sent ? (
          <div className="notice-box">
            인증 링크를 이메일로 보냈어요. 메일함에서 링크를 눌러 로그인을
            완료해 주세요.
          </div>
        ) : (
          <>
            <label>
              학교 이메일
              <input
                name="email"
                type="email"
                placeholder={`student@${schoolDomain}`}
                required
              />
            </label>
            <button className="button primary" disabled={busy}>
              {busy ? "처리 중..." : "이메일 인증 링크 받기"}
            </button>
          </>
        )}
        {demo && (
          <>
            <div className="notice-box">
              Supabase가 아직 연결되지 않았어요. 체험 모드에서는 실제 이메일을
              발송하지 않습니다.
            </div>
            <button className="button outline" type="button" onClick={onDemo}>
              데모 체험하기
            </button>
          </>
        )}
      </form>
    </Modal>
  );
}
export default App;
