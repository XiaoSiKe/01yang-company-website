'use client';

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Braces,
  Cloud,
  GraduationCap,
  Network,
  Pause,
  Play,
} from 'lucide-react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript } from 'react-icons/si';
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import AccordionGallery from '../components/AccordionGallery';
import Beams from '../components/ClientBeams';
import CardSwap, { Card } from '../components/CardSwap';
import LogoLoop from '../components/LogoLoop';
import PillNav from '../components/PillNav';
import ShinyText, { type ShinyTextProps } from '../components/ShinyText';
import SpecularButton, { type SpecularButtonProps } from '../components/SpecularButton';
import StrokeDepthText from '../components/StrokeDepthText';

const navigation = [
  { label: '首页', href: '#home' },
  { label: '关于零一', href: '#about' },
  { label: '服务与合作', href: '#services' },
  { label: '联系', href: '#contact' },
];

const specularButtonAppearance = {
  size: 'lg',
  radius: 18,
  tint: '#ffffff',
  tintOpacity: 0,
  blur: 0,
  textColor: '#ffffff',
  lineColor: '#ffffff',
  baseColor: '#525252',
  intensity: 1,
  shineSize: 10,
  shineFade: 40,
  thickness: 1,
  speed: 0.35,
  followMouse: true,
  proximity: 250,
  autoAnimate: false,
} satisfies SpecularButtonProps;

const shinyTextAppearance = {
  speed: 2,
  delay: 0,
  color: 'rgba(255, 255, 255, 0.78)',
  shineColor: '#ffffff',
  spread: 120,
  direction: 'left',
  yoyo: false,
  pauseOnHover: false,
} satisfies Omit<ShinyTextProps, 'text'>;

const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  {
    node: <SiTypescript />,
    title: 'TypeScript',
    href: 'https://www.typescriptlang.org',
  },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
];

const projectItems = [
  { image: '/projects/1015.jpg', label: 'AI SaaS' },
  { image: '/projects/1018.jpg', label: '模型服务' },
  { image: '/projects/1039.jpg', label: '软件开发' },
  { image: '/projects/1043.jpg', label: '网络服务' },
  { image: '/projects/1044.jpg', label: 'AI 教育' },
];

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const services: Array<{
  number: string;
  title: string;
  englishTitle: string;
  description: string;
  tags: string[];
  icon: Icon;
  featured?: boolean;
}> = [
  {
    number: '01',
    title: 'AI SaaS 服务',
    englishTitle: 'AI PRODUCTS',
    description:
      '从场景梳理、产品设计到持续迭代，把模型能力封装成清晰、稳定、真正有人使用的智能产品。',
    tags: ['智能工作流', 'Agent 应用', '业务自动化'],
    icon: Bot,
    featured: true,
  },
  {
    number: '02',
    title: 'AI 模型 API 服务',
    englishTitle: 'MODEL ACCESS',
    description:
      '整合多模型调用链路，提供统一接入、用量管理与工程支持，降低团队使用 AI 的技术门槛。',
    tags: ['统一接口', '模型接入', '调用管理'],
    icon: Network,
  },
  {
    number: '03',
    title: '软件定制开发',
    englishTitle: 'SOFTWARE',
    description:
      '围绕业务目标完成 Web、移动端、后台系统与自动化工具开发，让创意快速成为可运行的产品。',
    tags: ['Web 应用', '系统开发', '技术咨询'],
    icon: Braces,
  },
  {
    number: '04',
    title: '网络技术服务',
    englishTitle: 'INFRASTRUCTURE',
    description:
      '提供云端架构、部署集成与运维支持，让产品从上线第一天起就拥有清晰、可靠的技术底座。',
    tags: ['云端部署', '系统集成', '运行维护'],
    icon: Cloud,
  },
  {
    number: '05',
    title: 'AI 教育与培训',
    englishTitle: 'AI EDUCATION',
    description:
      '面向个人与团队提供 AI 工具、智能体和自动化实践培训，把新的技术能力转化为工作生产力。',
    tags: ['企业内训', '实战课程', '能力共创'],
    icon: GraduationCap,
  },
];

const process = [
  {
    number: '01',
    label: 'DEFINE',
    title: '先定义真正的问题',
    description: '从目标、用户与约束出发，找到值得被技术解决的核心问题。',
  },
  {
    number: '02',
    label: 'BUILD',
    title: '再构建可用的产品',
    description: '用设计、工程与 AI 能力快速验证，并沉淀为稳定的产品体验。',
  },
  {
    number: '03',
    label: 'GROW',
    title: '持续走向更好',
    description: '根据真实反馈迭代，让产品、团队与业务一起获得长期成长。',
  },
];

function usePageMotion(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let context: gsap.Context | undefined;
    let motionPreference: gsap.MatchMedia | undefined;
    let cancelled = false;

    void import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      motionPreference = gsap.matchMedia();
      context = gsap.context(() => {
        motionPreference?.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            '[data-hero-reveal]',
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.82,
              stagger: 0.09,
              delay: 0.28,
              ease: 'power3.out',
            },
          );

          gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
            gsap.fromTo(
              element,
              { autoAlpha: 0, y: 42 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.78,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: element,
                  start: 'top 86%',
                  once: true,
                },
              },
            );
          });

          gsap.utils.toArray<HTMLElement>('[data-line-reveal]').forEach((element) => {
            gsap.fromTo(
              element,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 1,
                ease: 'power3.out',
                transformOrigin: 'left center',
                scrollTrigger: {
                  trigger: element,
                  start: 'top 90%',
                  once: true,
                },
              },
            );
          });
        });

        motionPreference?.add('(prefers-reduced-motion: reduce)', () => {
          gsap.set('[data-hero-reveal], [data-reveal], [data-line-reveal]', {
            clearProps: 'transform,opacity,visibility',
          });
        });
      }, root);

      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      motionPreference?.revert();
      context?.revert();
    };
  }, [rootRef]);
}

function useActiveSection() {
  const [activeHref, setActiveHref] = useState('#home');

  useEffect(() => {
    const sectionMappings = [
      { selector: '#home', activeHref: '#home' },
      { selector: '#services', activeHref: '#services' },
      { selector: '#approach', activeHref: '#services' },
      { selector: '#about', activeHref: '#about' },
      { selector: '#contact', activeHref: '#contact' },
    ];
    const activeHrefById = new Map(
      sectionMappings.map(({ selector, activeHref }) => [selector.slice(1), activeHref]),
    );
    const sections = sectionMappings
      .map(({ selector }) => document.querySelector<HTMLElement>(selector))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveHref(activeHrefById.get(visible.target.id) ?? '#home');
        }
      },
      {
        rootMargin: '-18% 0px -62% 0px',
        threshold: [0, 0.15, 0.4],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeHref;
}

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const [isServiceSwapPaused, setIsServiceSwapPaused] = useState(false);
  const activeHref = useActiveSection();
  usePageMotion(pageRef);

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>

      <PillNav
        logo="/01yang-logo.jpg"
        logoAlt="零一扬网络科技"
        items={navigation}
        activeHref={activeHref}
        ease="power2.easeOut"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#ffffff"
      />

      <main ref={pageRef} id="main-content" className="site-shell">
        <div className="site-background" aria-hidden="true">
          <Beams
            beamWidth={2}
            beamHeight={15}
            beamNumber={16}
            lightColor="#ffffff"
            speed={5.2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={33}
          />
          <div className="site-background__veil" />
        </div>

        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <h1 id="hero-title">
              <StrokeDepthText text="福州零一扬网络科技有限公司" letterSpacing={-3.92} />
            </h1>
            <p className="hero__slogan">
              <StrokeDepthText text="从零到一， 让人工智能真正落地！" letterSpacing={-3.11} />
            </p>

            <div className="hero__actions" aria-label="首页操作" data-hero-reveal>
              <SpecularButton
                {...specularButtonAppearance}
                className="hero__specular-button"
                onClick={() => document.querySelector('#services')?.scrollIntoView()}
              >
                探索我们的服务
                <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" />
              </SpecularButton>
              <SpecularButton
                {...specularButtonAppearance}
                className="hero__specular-button"
                onClick={() => document.querySelector('#contact')?.scrollIntoView()}
              >
                开始合作
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </SpecularButton>
            </div>
          </div>

        </section>

        <section className="section services" aria-labelledby="services-title">
          <div id="services" className="section__inner">
            <div className="services__layout">
              <div className="section-heading services__heading">
                <p className="section-kicker" data-reveal>
                  <span>01</span>
                  WHAT WE BUILD
                </p>
                <div>
                  <h2 id="services-title" data-reveal>
                    <ShinyText
                      text={'把 AI 能力，\n变成真正可用的产品。'}
                      {...shinyTextAppearance}
                    />
                  </h2>
                  <p className="section-intro" data-reveal>
                    不追逐概念，只围绕真实需求构建清晰、可靠、可持续迭代的数字化解决方案。
                  </p>
                </div>
              </div>

              <div className="service-swap-stage" data-reveal>
                <CardSwap
                  cardDistance={60}
                  verticalDistance={70}
                  delay={5000}
                  pauseOnHover={false}
                  paused={isServiceSwapPaused}
                >
                  {services.map((service) => {
                    const ServiceIcon = service.icon;
                    const titleId = `service-${service.number}-title`;

                    return (
                      <Card
                        key={service.number}
                        className={`service-card${
                          service.featured ? ' service-card--featured' : ''
                        }`}
                        aria-labelledby={titleId}
                      >
                        <div className="service-card__top">
                          <span className="service-card__number">{service.number}</span>
                          <span className="service-card__icon" aria-hidden="true">
                            <ServiceIcon width={22} height={22} strokeWidth={1.6} />
                          </span>
                        </div>
                        <div className="service-card__body">
                          <p>{service.englishTitle}</p>
                          <h3 id={titleId}>
                            <ShinyText text={service.title} {...shinyTextAppearance} />
                          </h3>
                          <p className="service-card__description">{service.description}</p>
                        </div>
                        <ul className="tag-list" aria-label={`${service.title}能力`}>
                          {service.tags.map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
                      </Card>
                    );
                  })}
                </CardSwap>
                <SpecularButton
                  {...specularButtonAppearance}
                  size="sm"
                  className="service-swap-control"
                  onClick={() => setIsServiceSwapPaused((isPaused) => !isPaused)}
                >
                  {isServiceSwapPaused ? (
                    <Play size={14} strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <Pause size={14} strokeWidth={1.8} aria-hidden="true" />
                  )}
                  {isServiceSwapPaused ? '继续轮换' : '暂停轮换'}
                </SpecularButton>
              </div>
            </div>

            <div className="services__projects" data-reveal>
              <div className="services__projects-heading">
                <p>PROJECTS / COMING SOON</p>
                <h3>
                  <ShinyText text="项目实践" {...shinyTextAppearance} />
                </h3>
                <p>这里将逐步收录零一扬的产品、合作项目与技术实践。</p>
              </div>
              <AccordionGallery
                items={projectItems}
                defaultIndex={2}
                expandRatio={0.52}
                trigger="hover"
                ariaLabel="项目实践预览"
              />
            </div>
          </div>
        </section>

        <section className="section approach" aria-labelledby="approach-title">
          <div id="approach" className="section__inner">
            <div className="section-heading">
              <p className="section-kicker section-kicker--dark" data-reveal>
                <span>02</span>
                HOW WE WORK
              </p>
              <div>
                <h2 id="approach-title" data-reveal>
                  <ShinyText
                    text={'不只交付代码，\n更交付一条从想法到价值的路径。'}
                    {...shinyTextAppearance}
                  />
                </h2>
                <p className="section-intro" data-reveal>
                  技术只是手段。我们把产品判断、体验设计与工程能力放在同一个目标下，
                  让每一步都更接近真实价值。
                </p>
              </div>
            </div>

            <div className="process-list">
              {process.map((step) => (
                <article className="process-step" key={step.number} data-reveal>
                  <span className="process-step__line" data-line-reveal aria-hidden="true" />
                  <div className="process-step__meta">
                    <span>{step.number}</span>
                    <span>{step.label}</span>
                  </div>
                  <h3>
                    <ShinyText text={step.title} {...shinyTextAppearance} />
                  </h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section about" aria-labelledby="about-title">
          <div id="about" className="section__inner">
            <div className="section-heading">
              <p className="section-kicker" data-reveal>
                <span>03</span>
                ABOUT 01YANG
              </p>
              <div>
                <h2 id="about-title" data-reveal>
                  <ShinyText
                    text={'生于数字时代，\n为下一个智能时代而来。'}
                    {...shinyTextAppearance}
                  />
                </h2>
              </div>
            </div>

            <div className="about__grid">
              <p className="about__signature" data-reveal aria-label="创始人零一扬">
                ZERO
                <br />
                ONE
                <br />
                YANG
              </p>
              <div className="about__content">
                <div className="about__copy" data-reveal>
                  <p>
                    福州零一扬网络科技有限公司由零一扬创立。我们专注 AI 产品、软件工程与数字化服务，
                    帮助企业、团队和创造者把新的技术能力转化为真正可用的产品。
                  </p>
                  <p>
                    “零一”代表从无到有的创造，“扬”代表让价值被看见。我们相信，好技术应当清晰、可靠，
                    并且最终服务于真实的人。
                  </p>
                </div>

                <dl className="about__facts" data-reveal>
                  <div>
                    <dt>公司</dt>
                    <dd>福州零一扬网络科技有限公司</dd>
                  </div>
                  <div>
                    <dt>创始人</dt>
                    <dd>零一扬</dd>
                  </div>
                  <div>
                    <dt>服务方向</dt>
                    <dd>AI · 软件 · 网络 · 教育</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="section contact" aria-labelledby="contact-title">
          <div id="contact" className="section__inner contact__inner">
            <div className="contact__layout">
              <div className="section-heading contact__heading">
                <p className="section-kicker section-kicker--dark" data-reveal>
                  <span>04</span>
                  START A PROJECT
                </p>
                <div>
                  <h2 id="contact-title" data-reveal>
                    <ShinyText
                      text={'下一个从 0 到 1，\n从这里开始。'}
                      {...shinyTextAppearance}
                    />
                  </h2>
                  <p className="section-intro" data-reveal>
                    如果你正在构建一款 AI 产品、升级现有系统，或希望让团队真正掌握 AI，欢迎和我们聊聊。
                  </p>
                  <div className="contact__actions" data-reveal>
                    <SpecularButton
                      {...specularButtonAppearance}
                      className="contact__button"
                      onClick={() => {
                        window.location.href = 'mailto:1241798750@qq.com';
                      }}
                    >
                      <span className="contact__button-copy">
                        联系合作
                        <small>1241798750@qq.com</small>
                      </span>
                      <span className="contact__button-icon" aria-hidden="true">
                        <ArrowRight size={28} strokeWidth={1.5} />
                      </span>
                    </SpecularButton>
                  </div>
                </div>
              </div>

              <aside className="contact__wechat" aria-labelledby="wechat-contact-title" data-reveal>
                <div className="contact__wechat-heading">
                  <p>WECHAT</p>
                  <h3 id="wechat-contact-title">微信扫码添加零一扬</h3>
                </div>
                <div className="contact__qr-frame">
                  <Image
                    src="/wechat-qr.jpg"
                    alt="零一扬微信二维码"
                    width={736}
                    height={736}
                    sizes="(max-width: 720px) 280px, 320px"
                    unoptimized
                  />
                </div>
                <p className="contact__wechat-note">扫描二维码，添加微信沟通项目。</p>
              </aside>
            </div>

            <div className="contact__bottom">
              <div className="contact__logo-loop">
                <LogoLoop
                  logos={techLogos}
                  speed={80}
                  direction="left"
                  logoHeight={48}
                  gap={40}
                  hoverSpeed={0}
                  scaleOnHover
                  fadeOut
                  fadeOutColor="#050505"
                  ariaLabel="核心技术栈"
                />
              </div>

              <footer className="footer">
                <p>
                  © 2026 福州零一扬网络科技有限公司
                  <br />
                  <a
                    className="footer__icp"
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    闽ICP备2026024313号-2
                  </a>
                </p>
              </footer>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
