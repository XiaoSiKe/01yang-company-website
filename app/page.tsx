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
} from 'lucide-react';
import { gsap } from 'gsap';
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import Beams from '../components/ClientBeams';
import PillNav from '../components/PillNav';

const navigation = [
  { label: '首页', href: '#home' },
  { label: '服务', href: '#services' },
  { label: '关于', href: '#about' },
  { label: '联系', href: '#contact' },
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
  const activeHref = useActiveSection();
  usePageMotion(pageRef);

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>

      <PillNav
        logoAlt="零一扬科技"
        items={navigation}
        activeHref={activeHref}
        ease="power2.out"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />

      <main ref={pageRef} id="main-content">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero__beams" aria-hidden="true">
            <Beams
              beamWidth={2}
              beamHeight={15}
              beamNumber={12}
              lightColor="#ffffff"
              speed={5.2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={0}
            />
          </div>
          <div className="hero__veil" aria-hidden="true" />

          <div className="hero__content">
            <p className="hero__eyebrow" data-hero-reveal>
              <span aria-hidden="true" />
              福州零一扬网络科技有限公司
            </p>
            <h1 id="hero-title" data-hero-reveal>
              从 0 到 1，
              <br />
              让智能真正落地。
            </h1>
            <p className="hero__slogan" data-hero-reveal>
              让每一个想法，拥有智能生长的力量。
            </p>
            <p className="hero__summary" data-hero-reveal>
              以 AI 为引擎，连接模型、软件与业务，为企业提供从基础设施到产品落地的一站式数字化能力。
            </p>

            <div className="hero__actions" aria-label="首页操作" data-hero-reveal>
              <a className="button button--light" href="#services">
                探索我们的服务
                <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" />
              </a>
              <a className="button button--glass" href="#contact">
                开始合作
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hero__foot" aria-hidden="true" data-hero-reveal>
            <span>AI SaaS</span>
            <span>MODEL API</span>
            <span>SOFTWARE</span>
            <span>AI EDUCATION</span>
          </div>
        </section>

        <section id="services" className="section services" aria-labelledby="services-title">
          <div className="section__inner">
            <div className="section-heading">
              <p className="section-kicker" data-reveal>
                <span>01</span>
                WHAT WE BUILD
              </p>
              <div>
                <h2 id="services-title" data-reveal>
                  把 AI 能力，
                  <br />
                  变成真正可用的产品。
                </h2>
                <p className="section-intro" data-reveal>
                  不追逐概念，只围绕真实需求构建清晰、可靠、可持续迭代的数字化解决方案。
                </p>
              </div>
            </div>

            <div className="service-grid">
              {services.map((service) => {
                const ServiceIcon = service.icon;

                return (
                  <article
                    key={service.number}
                    className={`service-card${service.featured ? ' service-card--featured' : ''}`}
                    data-reveal
                  >
                    <div className="service-card__top">
                      <span className="service-card__number">{service.number}</span>
                      <span className="service-card__icon" aria-hidden="true">
                        <ServiceIcon width={22} height={22} strokeWidth={1.6} />
                      </span>
                    </div>
                    <div className="service-card__body">
                      <p>{service.englishTitle}</p>
                      <h3>{service.title}</h3>
                      <p className="service-card__description">{service.description}</p>
                    </div>
                    <ul className="tag-list" aria-label={`${service.title}能力`}>
                      {service.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="approach" className="section approach" aria-labelledby="approach-title">
          <div className="section__inner">
            <p className="section-kicker section-kicker--dark" data-reveal>
              <span>02</span>
              HOW WE WORK
            </p>

            <div className="approach__statement">
              <h2 id="approach-title" data-reveal>
                不只交付代码，
                <br />
                更交付一条从想法到价值的路径。
              </h2>
              <p data-reveal>
                技术只是手段。我们把产品判断、体验设计与工程能力放在同一个目标下，
                让每一步都更接近真实价值。
              </p>
            </div>

            <div className="process-list">
              {process.map((step) => (
                <article className="process-step" key={step.number} data-reveal>
                  <span className="process-step__line" data-line-reveal aria-hidden="true" />
                  <div className="process-step__meta">
                    <span>{step.number}</span>
                    <span>{step.label}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section about" aria-labelledby="about-title">
          <div className="section__inner">
            <div className="about__grid">
              <div>
                <p className="section-kicker" data-reveal>
                  <span>03</span>
                  ABOUT 01YANG
                </p>
                <p className="about__signature" data-reveal aria-label="创始人零一扬">
                  ZERO
                  <br />
                  ONE
                  <br />
                  YANG
                </p>
              </div>

              <div className="about__content">
                <h2 id="about-title" data-reveal>
                  生于数字时代，
                  <br />
                  为下一个智能时代而来。
                </h2>
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

        <section id="contact" className="section contact" aria-labelledby="contact-title">
          <div className="contact__orb contact__orb--one" aria-hidden="true" />
          <div className="contact__orb contact__orb--two" aria-hidden="true" />
          <div className="section__inner contact__inner">
            <p className="section-kicker section-kicker--dark" data-reveal>
              <span>04</span>
              START A PROJECT
            </p>
            <div className="contact__content">
              <h2 id="contact-title" data-reveal>
                下一个从 0 到 1，
                <br />
                从这里开始。
              </h2>
              <p data-reveal>
                如果你正在构建一款 AI 产品、升级现有系统，或希望让团队真正掌握 AI，欢迎和我们聊聊。
              </p>
              <a
                className="contact__link"
                href="mailto:hello@01yang.space"
                data-reveal
              >
                <span>
                  联系合作
                  <small>hello@01yang.space</small>
                </span>
                <span className="contact__link-icon" aria-hidden="true">
                  <ArrowRight size={28} strokeWidth={1.5} />
                </span>
              </a>
            </div>

            <footer className="footer">
              <p>© 2026 福州零一扬网络科技有限公司</p>
              <a href="#home">回到顶部 ↑</a>
              <p>www.01yang.space</p>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
