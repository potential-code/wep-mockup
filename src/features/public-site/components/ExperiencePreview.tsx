import { Link } from '@tanstack/react-router'
import { ArrowRight, FileCheck2, Lock, Unlock } from 'lucide-react'
import { motion } from 'motion/react'
import { CountUp } from '@/components/motion/CountUp'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel } from '@/components/shared/Cards'
import { Progress } from '@/components/ui/progress'
import { images } from '@/config/images'

const panel = 'flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card'

export function ExperiencePreview() {
  return (
    <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-12" gap={0.08}>
      <StaggerItem className="lg:col-span-5">
        <motion.div whileHover={{ y: -4 }} className={`${panel} p-6`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading font-semibold text-lg text-navy">Company progress</h3>
            <DemoLabel />
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            One view of how your team is moving from commitment to action.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="font-bold font-heading text-5xl text-navy">
                <CountUp value={75} suffix="%" />
              </p>
              <p className="mt-1 text-muted-foreground text-sm">Team activated (18 of 24)</p>
              <Progress value={75} className="mt-3 h-2" aria-label="Team activated 75 percent" />
            </div>
            <div>
              <p className="font-bold font-heading text-5xl text-blue">
                <CountUp value={67} suffix="%" />
              </p>
              <p className="mt-1 text-muted-foreground text-sm">Completed pathways (12 of 18)</p>
              <Progress
                value={67}
                className="mt-3 h-2"
                aria-label="Pathways completed 67 percent"
              />
            </div>
          </div>
        </motion.div>
      </StaggerItem>

      <StaggerItem className="lg:col-span-7">
        <motion.div whileHover={{ y: -4 }} className={`${panel} sm:flex-row`}>
          <img
            src={images.courses.fairProgressionPay.src}
            alt=""
            loading="lazy"
            className="h-40 w-full object-cover sm:h-auto sm:w-2/5"
          />
          <div className="grid flex-1 content-between gap-4 p-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-blue text-xs uppercase tracking-wider">
                  Learning · HR pathway
                </p>
                <DemoLabel />
              </div>
              <h3 className="mt-2 font-heading font-semibold text-lg text-navy">
                Fair progression and pay
              </h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Short lessons by department, with points for each completed module.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Module 3 of 5</span>
                <span className="font-semibold text-navy">
                  <CountUp value={60} suffix="%" />
                </span>
              </div>
              <Progress value={60} className="mt-2 h-2" aria-label="Course 60 percent complete" />
            </div>
          </div>
        </motion.div>
      </StaggerItem>

      <StaggerItem className="lg:col-span-7">
        <motion.div whileHover={{ y: -4 }} className={`${panel} p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-heading font-semibold text-lg text-navy">Clinic access</h3>
            <DemoLabel />
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            Preparation unlocks live expert time, so every session is used well.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-success-soft p-4">
              <Unlock className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
              <div>
                <p className="font-semibold text-navy text-sm">Procurement clinic</p>
                <p className="text-muted-foreground text-xs">Unlocked · pathway complete</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
              <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <p className="font-semibold text-navy text-sm">Inclusive hiring webinar</p>
                <p className="text-muted-foreground text-xs">One lesson left to unlock</p>
              </div>
            </div>
          </div>
          <p className="mt-auto pt-5 text-muted-foreground text-sm">
            Department pathways and qualifying points decide when a clinic opens for each person.
          </p>
        </motion.div>
      </StaggerItem>

      <StaggerItem className="lg:col-span-5">
        <motion.div whileHover={{ y: -4 }} className={`${panel} bg-navy p-6 text-white`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-heading font-semibold text-lg">
              <FileCheck2 className="size-5 text-gold" aria-hidden /> Annual report
            </h3>
            <DemoLabel className="border-white/30 bg-white/10 text-white">
              Illustrative data
            </DemoLabel>
          </div>
          <p className="mt-6 font-bold font-heading text-5xl">
            <CountUp value={5} />
            <span className="text-white/50"> / 8</span>
          </p>
          <p className="mt-1 text-sm text-white/70">sections drafted (62.5%)</p>
          <Progress
            value={62.5}
            className="mt-4 h-2 bg-white/15 [&>div]:bg-gold"
            aria-label="Report 62.5 percent drafted"
          />
          <Link
            to="/about"
            hash="portal"
            className="mt-auto inline-flex items-center gap-2 pt-6 font-medium text-gold text-sm"
          >
            How reporting works <ArrowRight className="size-4" aria-hidden />
          </Link>
        </motion.div>
      </StaggerItem>
    </Stagger>
  )
}
