import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Check } from 'lucide-react'

/* 本地素材（相对路径，由 Vite 打包到本地，无任何远程资源） */
import sceneGoldenHour from '../input_assets/lumora-scene-01-golden-hour.mp4'
import sceneStillWater from '../input_assets/lumora-scene-02-still-water.mp4'
import sceneDeepWoods from '../input_assets/lumora-scene-03-deep-woods.mp4'
import sceneQuietDawn from '../input_assets/lumora-scene-04-quiet-dawn.mp4'
import carriageOverlay from '../input_assets/lumora-foreground-overlay.png'

/* ---------------- 数据 ---------------- */

const SCENES = [
  { name: '金色时刻', src: sceneGoldenHour },
  { name: '静水', src: sceneStillWater },
  { name: '深林', src: sceneDeepWoods },
  { name: '静谧黎明', src: sceneQuietDawn },
] as const

const DEEP_WOODS_INDEX = 2
const FADE_MS = 1000
const CYCLE_MS = 10_000
const STORAGE_KEY = 'chengjing-early-access-email'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NAV_ITEMS = [
  { label: '如何工作', href: '#how' },
  { label: '特点', href: '#features' },
  { label: '价格', href: '#pricing' },
  { label: '社区', href: '#community' },
] as const

const HERO_STATS = [
  '60+ 次深度专注',
  '12,000+ 位创作者',
  '4.8 用户满意度',
  '意图优先设计',
] as const

const STEPS = [
  {
    title: '选择风景',
    text: '挑选与当下能量相合的氛围。',
  },
  {
    title: '写下一件事',
    text: '在开始前决定此刻真正值得注意的目标。',
  },
  {
    title: '完成一次专注',
    text: '让风景和安静的结构替你守住边界。',
  },
] as const

const FEATURES = [
  {
    title: '干扰屏障',
    text: '开始专注之后，通知、弹窗和多余入口都会暂时退到远处，不被轻易打断。',
  },
  {
    title: '四种动态风景',
    text: '金色时刻、静水、深林与静谧黎明，真实光影随时间缓缓轮换。',
  },
  {
    title: '意图式专注',
    text: '先写下此刻最重要的一件事，再让整段时间围绕它展开。',
  },
  {
    title: '温和回顾',
    text: '用轻柔的节奏回看自己的专注历程，没有红色警报，也没有愧疚。',
  },
] as const

const PLANS = [
  {
    name: '静心版',
    price: '免费',
    period: '',
    featured: false,
    features: ['四种风景', '基础专注计时器', '每周三次专注'],
  },
  {
    name: '心流版',
    price: '8 美元',
    period: '每月',
    featured: true,
    features: ['不限次数', '自定义专注习惯', '温和数据回顾'],
  },
  {
    name: '创作室版',
    price: '16 美元',
    period: '每月',
    featured: false,
    features: ['高级日程', '共享专注房间', '创作者工具'],
  },
] as const

const COMMUNITY_STATS = [
  { value: '12,000+', label: '位创作者' },
  { value: '68', label: '个国家和地区' },
  { value: '4.8/5', label: '满意度' },
] as const

/* ---------------- 首屏 ---------------- */

function Hero() {
  const [active, setActive] = useState(0)
  const [pageHidden, setPageHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false,
  )
  const [resetTick, setResetTick] = useState(0)

  const activeRef = useRef(0)
  const lockRef = useRef(false)

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [signedUp, setSignedUp] = useState(false)
  const [focusFlash, setFocusFlash] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const flashTimerRef = useRef<number | null>(null)

  const isDeepWoods = active === DEEP_WOODS_INDEX

  /* 带锁的风景切换：1000ms 交叉淡化期间忽略其他请求 */
  const changeScene = useCallback((next: number) => {
    if (lockRef.current) return
    if (next === activeRef.current) return
    lockRef.current = true
    activeRef.current = next
    setActive(next)
    window.setTimeout(() => {
      lockRef.current = false
    }, FADE_MS)
  }, [])

  /* 自动循环：页面可见时每 10s 前进；可见性变化或手动选择都会重置计时，且始终只有一个计时器 */
  useEffect(() => {
    if (pageHidden) return
    const timer = window.setTimeout(() => {
      changeScene((activeRef.current + 1) % SCENES.length)
    }, CYCLE_MS)
    return () => window.clearTimeout(timer)
  }, [active, pageHidden, resetTick, changeScene])

  /* 进入后台暂停，回到前台平稳恢复 */
  useEffect(() => {
    const handleVisibility = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const handleSceneClick = (index: number) => {
    changeScene(index)
    // 即使点击的是当前风景，也重新开始 10 秒计时
    setResetTick((tick) => tick + 1)
  }

  /* 键盘左右键也可切换风景（非触摸、桌面端体验） */
  const handleSceneKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      handleSceneClick((activeRef.current + 1) % SCENES.length)
    } else if (event.key === 'ArrowLeft') {
      handleSceneClick((activeRef.current + SCENES.length - 1) % SCENES.length)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (error) setError('')
    if (signedUp) setSignedUp(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = email.trim()
    if (!EMAIL_PATTERN.test(value)) {
      setError('请输入有效的邮箱地址。')
      setSignedUp(false)
      emailInputRef.current?.focus()
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* 本地存储不可用时仍给出已记录的界面反馈，不调用任何远程服务 */
    }
    setError('')
    setSignedUp(true)
  }

  /* “开始”：平滑回到首屏、聚焦邮箱并短暂高亮 */
  const handleGetStarted = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      emailInputRef.current?.focus()
      setFocusFlash(true)
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
      flashTimerRef.current = window.setTimeout(() => setFocusFlash(false), 1500)
    }, 480)
  }

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* 第 1 层：四段本地视频，铺满视口，仅当前风景完全可见 */}
      {SCENES.map((scene, index) => (
        <video
          key={scene.name}
          src={scene.src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* 极轻的电影感暗角，不遮挡风景 */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.04)_22%,rgba(0,0,0,0)_55%,rgba(0,0,0,0.16)_100%)]" />

      {/* 第 2 层：透明列车车厢前景，轻微呼吸，不露外缘 */}
      <img
        src={carriageOverlay}
        alt=""
        aria-hidden="true"
        className="carriage pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* 第 3 层：文字与控件 */}
      <div className="relative z-20 flex h-full flex-col">
        {/* 顶部导航：任何风景下始终白色 */}
        <nav className="flex items-center justify-between px-10 py-7">
          <a
            href="#top"
            className="font-display text-2xl italic text-white"
            aria-label="澄境首页"
          >
            澄境
          </a>
          <div className="liquid-glass flex items-center rounded-full py-1.5 pl-7 pr-1.5">
            <div className="flex items-center gap-8 pr-7">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-white/90 transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={handleGetStarted}
              className="whitespace-nowrap rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-colors duration-200 hover:bg-white/90"
            >
              开始
            </button>
          </div>
        </nav>

        {/* 中央内容（深林时整组在 700ms 内转为深蓝灰） */}
        <div
          className={`hero-copy flex flex-1 flex-col items-center justify-center px-10 text-center ${
            isDeepWoods ? 'deep' : ''
          }`}
        >
          <div className="hc-badge liquid-glass mb-8 rounded-full px-5 py-2 text-[0.8rem] tracking-[0.14em]">
            已有超过 10,000 人找回清晰与专注
          </div>

          <h1 className="hc-title max-w-[64rem] font-display text-[5.5rem] leading-[1.1]">
            在永不停歇的嘈杂世界里
            <br />
            找回宁静
          </h1>

          <p className="hc-body mt-7 max-w-[36rem] text-[1.05rem] leading-[1.95]">
            越过消息提醒、无尽滚动和持续要求带来的混乱。学会守护当下，有意识地创造。
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-10 w-[34rem] max-w-full">
            <div
              className={`liquid-glass email-capsule flex items-center gap-2 rounded-full py-2 pl-6 pr-2 ${
                focusFlash ? 'flash' : ''
              }`}
            >
              <input
                ref={emailInputRef}
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                placeholder="你的常用邮箱"
                aria-label="你的常用邮箱"
                aria-invalid={error ? 'true' : 'false'}
                className="hc-input h-10 min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none"
              />
              <button
                type="submit"
                disabled={signedUp}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors duration-200 hover:bg-white/90 disabled:cursor-default disabled:bg-white/90"
              >
                {signedUp ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    已记录
                  </>
                ) : (
                  '获取早期资格'
                )}
              </button>
            </div>
            <p
              role="status"
              aria-live="polite"
              className="hc-feedback mt-3 h-5 text-sm tracking-wide"
            >
              {error || (signedUp ? '早期资格申请已在当前设备记录。' : '')}
            </p>
          </form>

          {/* 风景切换器 */}
          <div
            className="mt-9 flex items-center gap-10"
            role="tablist"
            aria-label="选择风景"
            onKeyDown={handleSceneKeyDown}
          >
            {SCENES.map((scene, index) => {
              const isActive = index === active
              return (
                <button
                  key={scene.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSceneClick(index)}
                  className={`hc-tab border-b-2 pb-1.5 text-sm tracking-[0.2em] ${
                    isActive
                      ? 'hc-tab-active opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {scene.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 底部统计：始终保持白色 */}
        <div className="flex items-center justify-center px-10 pb-8">
          <div className="flex items-center text-[0.85rem] tracking-wide text-white/70">
            {HERO_STATS.map((stat, index) => (
              <span key={stat} className="flex items-center">
                <span>{stat}</span>
                {index < HERO_STATS.length - 1 && (
                  <span className="mx-7 h-4 w-px shrink-0 bg-white/25" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- 正文区 ---------------- */

function HowItWorks() {
  return (
    <section id="how" className="ambient border-t border-white/[0.06] py-40">
      <div className="relative mx-auto max-w-[72rem] px-12">
        <p className="section-label">如何工作</p>
        <h2 className="section-title mt-5">用更轻的方法进入深度专注</h2>

        <div className="mt-20 grid grid-cols-3 gap-12">
          {STEPS.map((step, index) => (
            <div key={step.title} className="border-t border-white/10 pt-8">
              <span className="font-display text-2xl italic text-white/40">
                0{index + 1}
              </span>
              <h3 className="mt-6 text-xl text-white">{step.title}</h3>
              <p className="mt-4 text-[0.95rem] leading-[1.95] text-white/60">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="ambient ambient-2 border-t border-white/[0.06] py-40">
      <div className="relative mx-auto max-w-[72rem] px-12">
        <p className="section-label">特点</p>
        <h2 className="section-title mt-5 max-w-[46rem]">
          保护注意力，而不是争夺注意力
        </h2>

        <div className="mt-20 grid grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="liquid-glass glass-card h-full rounded-[1.75rem] p-8"
            >
              <h3 className="text-lg text-white">{feature.title}</h3>
              <p className="mt-4 text-[0.9rem] leading-[1.9] text-white/60">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="ambient border-t border-white/[0.06] py-40">
      <div className="relative mx-auto max-w-[72rem] px-12">
        <p className="section-label">价格</p>
        <h2 className="section-title mt-5">安静开始，需要时再升级</h2>

        <div className="mt-24 grid grid-cols-3 items-start gap-7">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`liquid-glass glass-card relative rounded-[1.75rem] p-10 ${
                plan.featured ? 'glass-card--featured' : ''
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-xs font-medium tracking-[0.15em] text-black">
                  推荐方案
                </span>
              )}
              <h3 className="text-xl text-white">{plan.name}</h3>
              <div className="mt-7 flex items-baseline gap-2">
                <span className="font-display text-[2.6rem] leading-none text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-white/50">{plan.period}</span>
                )}
              </div>
              <div className="my-8 h-px bg-white/10" />
              <ul className="space-y-4 text-[0.92rem] leading-relaxed text-white/65">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-bullet">
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Community() {
  return (
    <section id="community" className="ambient ambient-2 border-t border-white/[0.06] py-40">
      <div className="relative mx-auto max-w-[72rem] px-12 text-center">
        <p className="section-label">社区</p>
        <h2 className="section-title mt-5">为认真创作的人留一处安静空间</h2>
        <p className="section-desc mx-auto mt-7 max-w-[36rem]">
          一个更安静的创作者网络，帮助人们保护注意力并分享有意识的作品。
        </p>

        <div className="mx-auto mt-20 grid w-full max-w-5xl grid-cols-3 gap-8 border-t border-white/10 pt-14">
          {COMMUNITY_STATS.map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-[3.4rem] leading-none text-white">
                {stat.value}
              </div>
              <div className="mt-4 text-sm tracking-[0.12em] text-white/55">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-24 text-xs tracking-[0.25em] text-white/30">
          澄境 · 为专注而生
        </p>
      </div>
    </section>
  )
}

/* ---------------- 页面 ---------------- */

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero />
      <main className="relative bg-[#070A0E]">
        <HowItWorks />
        <Features />
        <Pricing />
        <Community />
      </main>
    </div>
  )
}
