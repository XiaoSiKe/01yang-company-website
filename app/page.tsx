'use client';

import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript } from 'react-icons/si';
import { useEffect, useRef, useState } from 'react';
import AccordionGallery from '../components/AccordionGallery';
import BorderGlow from '../components/BorderGlow';
import ColorBends from '../components/ClientColorBends';
import LogoLoop from '../components/LogoLoop';
import PillNav from '../components/PillNav';
import SpecularButton, { type SpecularButtonProps } from '../components/SpecularButton';
import StrokeDepthText from '../components/StrokeDepthText';

const navigation = [
  { label: '首页', href: '#home' },
  { label: '关于零一', href: '#about' },
  { label: '产品与服务', href: '#services' },
  { label: '联系与合作', href: '#contact' },
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

const borderGlowAppearance = {
  edgeSensitivity: 30,
  backgroundColor: '#000000',
  borderRadius: 28,
  glowRadius: 40,
  glowIntensity: 1,
  coneSpread: 25,
  animated: false,
};

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
  {
    image: '/projects/1015.jpg',
    title: '第二十五小时',
    description: '建筑生模拟器',
    link: 'https://arch.25thgame.vip',
  },
  {
    image: '/projects/1039.jpg',
    title: '零一 API',
    description: '从零到一，连接每一次模型调用！',
    link: 'https://api.01yapi.com/',
  },
  {
    image: '/projects/1043.jpg',
    title: '零一 AI 日新社',
    description: '福州大学学生社团',
    link: 'https://club.01aiedu.com',
  },
];

const capabilities = [
  {
    title: 'AI 应用与 SaaS 开发',
    description: '从需求梳理开始，完成交互设计、前后端开发与上线交付，提供持续维护和版本迭代支持，让想法逐步成为可长期运行的 SaaS 产品。',
  },
  {
    title: 'AI 技术教育',
    description: '围绕 AI 工具使用、提示设计、AI 编程与真实业务流程，为企业、学校和团队设计培训与实践课程，帮助参与者建立可复用方法和操作能力。',
  },
  {
    title: '模型接入支持',
    description: '支持主流大模型 API、兼容接口与 Token 使用场景，完成鉴权、调用链路、成本与稳定性优化，并协助排查限流、超时与接入故障。',
  },
  {
    title: '网络基础设施',
    description: '提供服务器与云环境配置、域名解析、HTTPS、网络部署和基础运维，兼顾上线效率、安全隔离与可维护性，为其稳定运行提供底层支撑。',
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
            ScrollTrigger.create({
              trigger: element,
              start: 'top 86%',
              once: true,
              onEnter: () => {
                gsap.fromTo(
                  element,
                  { autoAlpha: 0, y: 36 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.78,
                    ease: 'power3.out',
                    clearProps: 'transform,opacity,visibility',
                  },
                );
              },
            });
          });
        });

        motionPreference?.add('(prefers-reduced-motion: reduce)', () => {
          gsap.set('[data-hero-reveal], [data-reveal]', {
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
          <ColorBends
            colors={['#f5f5f5', '#8f8f8f', '#d8d8d8']}
            rotation={90}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.15}
            parallax={0.5}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            transparent
          />
          <div className="site-background__veil" />
        </div>

        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <p className="hero__brand-pill" data-hero-reveal>
              <span aria-hidden="true">01</span>
              FUZHOU 01YANG NETWORK TECHNOLOGY CO., LTD.
            </p>
            <h1 id="hero-title">
              <StrokeDepthText text="福州零一扬网络科技有限公司" letterSpacing={-3.92} />
            </h1>
            <p className="hero__slogan">
              <StrokeDepthText text="从零到一， 让人工智能真正落地！" letterSpacing={-3.11} />
            </p>

            <a className="hero__date-pill" href="#about" data-hero-reveal>
              成立于 · <time dateTime="2026-01-26">2026.1.26</time>
            </a>

            <div className="hero__actions" aria-label="首页操作" data-hero-reveal>
              <SpecularButton
                {...specularButtonAppearance}
                className="hero__specular-button"
                onClick={() => document.querySelector('#services')?.scrollIntoView()}
              >
                产品与服务
                <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" />
              </SpecularButton>
              <SpecularButton
                {...specularButtonAppearance}
                className="hero__specular-button"
                onClick={() => document.querySelector('#contact')?.scrollIntoView()}
              >
                联系与合作
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </SpecularButton>
            </div>
          </div>

        </section>

        <section className="section about" aria-labelledby="about-title">
          <div id="about" className="section__inner">
            <div className="section-heading section-heading--reference">
              <h2 className="home-flow-title" id="about-title" data-reveal>
                关于零一
              </h2>
            </div>

            <div data-reveal>
              <BorderGlow {...borderGlowAppearance} className="about-glow">
                <div className="about-panel">
                  <div className="about-panel__intro">
                    <h3 className="about-panel__title">从零到一，让人工智能真正落地！</h3>
                    <div className="about-panel__facts">
                      <p><strong>零一扬网络科技成立于 2026 年 1 月 26 日，创始人：零一扬</strong></p>
                    </div>
                    <p>
                      福州零一扬网络科技有限公司专注于 AI 应用与软件工程，
                      <br />
                      为企业及团队提供 SaaS 开发、AI 教育、模型 API 与 Token 支持、网络及云基础设施服务。
                    </p>
                    <p>
                      从需求梳理、方案设计到开发交付与部署运行，
                      <br />
                      我们关注产品体验、系统稳定性与长期维护效率，
                      <br />
                      让技术更快进入真实场景，并持续创造价值。
                    </p>
                  </div>

                  <h3 className="about-panel__subheading">我们在做什么？</h3>
                  <div className="capability-grid" aria-label="零一扬的服务能力">
                    {capabilities.map((capability) => (
                      <article className="capability-card" key={capability.title}>
                        <h4>{capability.title}</h4>
                        <p>{capability.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </BorderGlow>
            </div>
          </div>
        </section>

        <section className="section services" aria-labelledby="services-title">
          <div id="services" className="section__inner">
            <div className="section-heading section-heading--reference">
              <h2 className="home-flow-title" id="services-title" data-reveal>
                产品与服务
              </h2>
            </div>

            <div className="project-gallery" data-reveal>
              <BorderGlow {...borderGlowAppearance} className="project-gallery__glow">
                <div className="project-gallery__frame">
                  <AccordionGallery
                    items={projectItems}
                    defaultIndex={1}
                    expandRatio={0.52}
                    trigger="hover"
                    ariaLabel="项目实践预览"
                  />
                </div>
              </BorderGlow>
            </div>
          </div>
        </section>

        <section className="section contact" aria-labelledby="contact-title">
          <div id="contact" className="section__inner contact__inner">
            <div className="contact__layout">
              <div className="section-heading section-heading--reference contact__heading">
                <div>
                  <h2 className="home-flow-title" id="contact-title" data-reveal>
                    联系与合作
                  </h2>
                  <div className="section-intro contact__intro" data-reveal>
                    <p>
                      无论你正在规划 SaaS 产品、接入 AI 模型与 Token 服务、搭建网络基础设施，
                      <br />
                      还是开展 AI 教育与团队培训，
                    </p>
                    <p>欢迎联系我们，聊聊你的需求与合作设想。</p>
                  </div>
                  <h3 className="contact__tagline" data-reveal>
                    下一个从零到一，从这里开始！
                  </h3>
                  <div className="contact__qq-reveal" data-reveal>
                    <BorderGlow {...borderGlowAppearance} className="contact__qq-glow">
                      <aside className="contact__qq" aria-label="QQ 联系方式">
                        <div className="contact__qr-frame">
                          <Image
                            src="/qq-qr.png"
                            alt="零一扬 QQ 二维码"
                            width={920}
                            height={920}
                            sizes="(max-width: 720px) 280px, 320px"
                            unoptimized
                          />
                        </div>
                      </aside>
                    </BorderGlow>
                  </div>
                </div>
              </div>
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
                  <span>© 2026 福州零一扬网络科技有限公司</span>
                  <a
                    className="footer__icp"
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    闽ICP备2026024313号-2
                  </a>
                  <a
                    className="footer__public-security"
                    href="https://beian.mps.gov.cn/#/query/webSearch?code=35011102351274"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    闽公网安备35011102351274号
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
