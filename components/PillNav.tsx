'use client';

import { gsap } from 'gsap';
import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

type PillNavProps = {
  logo?: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
};

export default function PillNav({
  logo,
  logoAlt = '零一扬科技',
  items,
  activeHref = '#home',
  className = '',
  ease = 'power2.out',
  baseColor = '#000000',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#ffffff',
  pillTextColor = '#000000',
}: PillNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setIsScrolled(window.scrollY > 24);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(shell, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    const animation = gsap.fromTo(
      shell,
      { autoAlpha: 0, y: -18, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, delay: 0.15, ease },
    );

    return () => {
      animation.kill();
    };
  }, [ease]);

  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!menu) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation: gsap.core.Tween | undefined;

    const applyReducedState = () => {
      if (!motionPreference.matches) return;

      animation?.kill();
      gsap.set(menu, {
        autoAlpha: isMenuOpen ? 1 : 0,
        y: 0,
        scale: 1,
        pointerEvents: isMenuOpen ? 'auto' : 'none',
      });
    };

    if (motionPreference.matches) {
      applyReducedState();
    } else {
      animation = gsap.to(menu, {
        autoAlpha: isMenuOpen ? 1 : 0,
        y: isMenuOpen ? 0 : -8,
        scale: isMenuOpen ? 1 : 0.98,
        duration: isMenuOpen ? 0.28 : 0.2,
        ease,
        overwrite: 'auto',
        pointerEvents: isMenuOpen ? 'auto' : 'none',
      });
    }

    motionPreference.addEventListener('change', applyReducedState);

    return () => {
      motionPreference.removeEventListener('change', applyReducedState);
      animation?.kill();
    };
  }, [ease, isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      setIsMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 721px)');
    const closeAtDesktop = () => {
      if (desktopQuery.matches) setIsMenuOpen(false);
    };

    desktopQuery.addEventListener('change', closeAtDesktop);
    return () => desktopQuery.removeEventListener('change', closeAtDesktop);
  }, []);

  const resetPill = (target: HTMLAnchorElement) => {
    gsap.set(target.querySelector('.pill-nav__fill'), { scaleY: 0 });
    gsap.set(target.querySelector('.pill-nav__label-main'), { yPercent: 0 });
    gsap.set(target.querySelector('.pill-nav__label-hover'), {
      yPercent: 130,
      autoAlpha: 0,
    });
  };

  const handleEnter = (target: HTMLAnchorElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resetPill(target);
      return;
    }

    gsap.to(target.querySelector('.pill-nav__fill'), {
      scaleY: 1,
      duration: 0.32,
      ease,
      overwrite: true,
    });
    gsap.to(target.querySelector('.pill-nav__label-main'), {
      yPercent: -130,
      duration: 0.32,
      ease,
      overwrite: true,
    });
    gsap.to(target.querySelector('.pill-nav__label-hover'), {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.32,
      ease,
      overwrite: true,
    });
  };

  const handleLeave = (target: HTMLAnchorElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resetPill(target);
      return;
    }

    gsap.to(target.querySelector('.pill-nav__fill'), {
      scaleY: 0,
      duration: 0.22,
      ease,
      overwrite: true,
    });
    gsap.to(target.querySelector('.pill-nav__label-main'), {
      yPercent: 0,
      duration: 0.22,
      ease,
      overwrite: true,
    });
    gsap.to(target.querySelector('.pill-nav__label-hover'), {
      yPercent: 130,
      autoAlpha: 0,
      duration: 0.22,
      ease,
      overwrite: true,
    });
  };

  const cssVars = {
    '--nav-base': baseColor,
    '--nav-pill': pillColor,
    '--nav-pill-text': pillTextColor,
    '--nav-hover-text': hoveredPillTextColor,
  } as CSSProperties;

  return (
    <header
      ref={shellRef}
      className={`pill-nav-shell ${className}`}
      data-scrolled={isScrolled}
      data-menu-open={isMenuOpen}
      style={cssVars}
    >
      <nav className="pill-nav" aria-label="主导航">
        <a
          className="pill-nav__brand"
          href="#home"
          aria-label="返回首页"
          onClick={() => setIsMenuOpen(false)}
        >
          {logo ? (
            <Image src={logo} alt={logoAlt} width={28} height={28} priority />
          ) : (
            <span aria-hidden="true">01</span>
          )}
        </a>

        <div className="pill-nav__desktop">
          {items.map((item) => {
            const isActive = activeHref === item.href;

            return (
              <a
                key={item.href}
                className="pill-nav__item"
                data-active={isActive}
                href={item.href}
                aria-label={item.ariaLabel ?? item.label}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={(event) => handleEnter(event.currentTarget)}
                onMouseLeave={(event) => handleLeave(event.currentTarget)}
                onFocus={(event) => handleEnter(event.currentTarget)}
                onBlur={(event) => handleLeave(event.currentTarget)}
              >
                <span className="pill-nav__fill" aria-hidden="true" />
                <span className="pill-nav__label">
                  <span className="pill-nav__label-main">{item.label}</span>
                  <span className="pill-nav__label-hover" aria-hidden="true">
                    {item.label}
                  </span>
                </span>
              </a>
            );
          })}
        </div>

        <button
          ref={menuButtonRef}
          className="pill-nav__menu-button"
          type="button"
          aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          className="pill-nav__mobile"
          aria-hidden={!isMenuOpen}
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? 'page' : undefined}
              onClick={() => {
                setIsMenuOpen(false);
                window.requestAnimationFrame(() => menuButtonRef.current?.focus());
              }}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
