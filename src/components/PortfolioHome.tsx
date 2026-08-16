'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { projects } from '@/lib/site'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const principles = [
  {
    title: 'Useful before impressive.',
    body: 'The interface should make the next step obvious. Polish matters most when it removes friction.',
  },
  {
    title: 'Native where it counts.',
    body: 'Good products feel at home on the device, respect familiar patterns, and still have a point of view.',
  },
  {
    title: 'Small details, shipped.',
    body: 'A clear, released product beats an overbuilt idea. I iterate with real feedback and keep the core calm.',
  },
]

export function PortfolioHome() {
  const scope = useRef<HTMLElement>(null)
  const [principle, setPrinciple] = useState(0)

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (reduceMotion) return

      gsap.from('[data-hero-item]', {
        y: 30,
        opacity: 0,
        duration: 0.85,
        stagger: 0.09,
        ease: 'power3.out',
      })

      gsap.fromTo(
        '.reveal-word',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-manifesto]',
            start: 'top 78%',
            end: 'bottom 42%',
            scrub: true,
          },
        },
      )

      gsap.utils.toArray<HTMLElement>('[data-project-card]').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 72, scale: 0.95, opacity: 0.35 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 52%',
              scrub: 0.7,
            },
          },
        )
      })
    },
    { scope },
  )

  function movePrinciple(direction: number) {
    setPrinciple(
      (current) =>
        (current + direction + principles.length) % principles.length,
    )
  }

  return (
    <main ref={scope} className="w-full max-w-full overflow-x-hidden">
      <section className="relative min-h-[92svh] px-4 pt-36 pb-20 sm:px-6 sm:pt-44">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
          <p
            data-hero-item
            className="text-sm font-medium tracking-[0.16em] text-ink/55 uppercase"
          >
            Developer based in Slovakia
          </p>
          <h1
            data-hero-item
            className="mt-8 max-w-6xl text-[clamp(3.35rem,8vw,7.8rem)] leading-[0.9] font-medium tracking-[-0.06em] text-balance"
          >
            I build digital products that feel{' '}
            <span className="relative inline-block h-[0.7em] w-[1.25em] overflow-hidden rounded-full align-[0.02em]">
              <Image
                src="/gabriel-avatar.png"
                alt="Gabriel"
                fill
                sizes="160px"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            </span>{' '}
            considered.
          </h1>
          <p
            data-hero-item
            className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/60 sm:text-xl"
          >
            I&apos;m Gabriel, an independent web and mobile app developer. I
            turn focused ideas into clear, useful experiences for the web and
            Apple platforms.
          </p>
          <div
            data-hero-item
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-medium text-paper transition-transform hover:-translate-y-1"
            >
              Explore projects <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="mailto:falis.gabriel@gmail.com"
              className="inline-flex items-center rounded-2xl border border-ink/15 bg-white/45 px-6 py-3.5 font-medium text-ink backdrop-blur transition-transform hover:-translate-y-1"
            >
              Start a conversation
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-32 sm:px-6 md:py-48">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.36fr_0.64fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-sm font-medium text-ink/50">
              What guides the work
            </p>
            <div className="mt-5 h-px w-full bg-ink/15" />
          </div>
          <p
            data-manifesto
            className="max-w-4xl text-[clamp(2.2rem,4.4vw,5rem)] leading-[1.02] font-medium tracking-[-0.045em]"
          >
            {'I care about useful ideas, quiet interfaces, and the small decisions that make technology easier to live with.'
              .split(' ')
              .map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="reveal-word inline-block"
                >
                  {word}&nbsp;
                </span>
              ))}
          </p>
        </div>
      </section>

      <section className="px-4 py-32 sm:px-6 md:py-48">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-ink/50">Selected work</p>
              <h2 className="mt-4 max-w-3xl text-5xl leading-none font-medium tracking-[-0.045em] sm:text-7xl">
                Built to solve, learn, and ship.
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 self-start font-medium underline decoration-ink/20 underline-offset-8 transition-colors hover:decoration-ink"
            >
              View every project <ArrowUpRightIcon className="size-4" />
            </Link>
          </div>

          <div className="mt-16 flex flex-col gap-4 md:flex-row">
            {projects.map((project, index) => (
              <Link
                key={project.name}
                data-project-card
                href={project.href}
                className={`project-card tone-${project.tone} group flex min-h-[29rem] flex-1 flex-col justify-between overflow-hidden rounded-[2rem] p-7 transition-[flex,transform] duration-700 ease-out hover:-translate-y-1 sm:p-9 md:hover:flex-[1.5]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink/55">
                    {project.type}
                  </span>
                  <span className="flex size-11 items-center justify-center rounded-full bg-white/55 transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRightIcon className="size-5" />
                  </span>
                </div>
                <div>
                  <span className="mb-6 block text-7xl font-medium text-ink/12">
                    0{index + 1}
                  </span>
                  <h3 className="text-4xl font-medium tracking-[-0.04em]">
                    {project.name}
                  </h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-ink/65">
                    {project.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-32 sm:px-6 md:py-48">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-flow-dense lg:grid-cols-12">
          <div className="rounded-[2rem] bg-white/55 p-8 ring-1 ring-ink/8 sm:p-12 lg:col-span-7">
            <p className="text-sm font-medium text-ink/50">
              How I approach a product
            </p>
            <div className="mt-24 sm:mt-36">
              <p className="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
                {principles[principle].title}
              </p>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/60">
                {principles[principle].body}
              </p>
            </div>
            <div className="mt-10 flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous principle"
                className="rounded-full border border-ink/15 p-3 transition-colors hover:bg-ink hover:text-paper"
                onClick={() => movePrinciple(-1)}
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Next principle"
                className="rounded-full border border-ink/15 p-3 transition-colors hover:bg-ink hover:text-paper"
                onClick={() => movePrinciple(1)}
              >
                <ChevronRightIcon className="size-5" />
              </button>
              <span className="ml-3 text-sm text-ink/45">
                {principle + 1} / {principles.length}
              </span>
            </div>
          </div>

          <div className="accent-grid min-h-[24rem] rounded-[2rem] bg-cobalt p-8 text-white sm:p-12 lg:col-span-5">
            <p className="text-sm font-medium text-white/60">Capabilities</p>
            <div className="mt-20 grid grid-cols-2 gap-x-5 gap-y-8 text-xl font-medium">
              <span>iOS</span>
              <span>Swift</span>
              <span>React</span>
              <span>TypeScript</span>
              <span>Product UI</span>
              <span>Web apps</span>
            </div>
          </div>

          {['Clarity', 'Care', 'Momentum'].map((value) => (
            <div
              key={value}
              className="flex min-h-44 items-end rounded-[2rem] border border-ink/10 p-7 lg:col-span-4"
            >
              <p className="text-3xl font-medium tracking-[-0.035em]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-32 sm:px-6 md:py-48">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-coral px-6 py-20 text-center sm:px-12 sm:py-28">
          <p className="text-sm font-medium text-ink/55">Have a useful idea?</p>
          <h2 className="mx-auto mt-5 max-w-5xl text-[clamp(3rem,7vw,7rem)] leading-[0.92] font-medium tracking-[-0.055em]">
            Let&apos;s make it real, clear, and ready to use.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="mailto:falis.gabriel@gmail.com"
              className="rounded-2xl bg-ink px-6 py-3.5 font-medium text-paper transition-transform hover:-translate-y-1"
            >
              Email Gabriel
            </Link>
            <Link
              href="/support"
              className="rounded-2xl bg-white/55 px-6 py-3.5 font-medium text-ink transition-transform hover:-translate-y-1"
            >
              App support
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
