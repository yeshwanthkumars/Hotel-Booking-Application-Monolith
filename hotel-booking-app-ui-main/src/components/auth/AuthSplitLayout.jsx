function FeaturePill({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default function AuthSplitLayout({
  eyebrow,
  heading,
  subheading,
  formTitle,
  formSubtitle,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[55%_45%]">
      <section className="relative overflow-hidden px-5 pb-8 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.26),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(251,191,36,0.28),transparent_36%),linear-gradient(135deg,#1e1b4b_0%,#4338ca_47%,#6d28d9_100%)]" />
        <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute bottom-10 right-8 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white backdrop-blur-sm transition hover:bg-white/20">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300 text-sm font-extrabold tracking-wide text-indigo-950 shadow-md shadow-amber-950/20">
                YK
              </span>
              <span>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Hotel Booking System</p>
                <p className="text-sm font-semibold">YK StayEase Platform</p>
              </span>
            </div>

            <div className="hidden sm:flex gap-2">
              <FeaturePill
                icon={<span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
                text="Trusted by 80+ hotels"
              />
            </div>
          </div>

          <div className="mt-8 lg:mt-auto lg:pb-10">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-200">{eyebrow}</p>
            <h1 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {heading}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              {subheading}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/20">
                <p className="text-xs uppercase tracking-[0.16em] text-indigo-200">Curated Properties</p>
                <p className="mt-2 text-2xl font-bold text-white">2,400+</p>
                <p className="mt-1 text-xs text-indigo-100">Luxury and boutique stays worldwide.</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/20">
                <p className="text-xs uppercase tracking-[0.16em] text-indigo-200">Average Rating</p>
                <p className="mt-2 text-2xl font-bold text-white">4.9/5</p>
                <p className="mt-1 text-xs text-indigo-100">Experience-first stays for every traveler.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[60vh] items-center justify-center bg-[linear-gradient(180deg,#f8faff_0%,#eef2ff_55%,#f8fafc_100%)] px-4 py-8 sm:px-8 lg:px-10">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.55)] backdrop-blur-md transition-all duration-300 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{formTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{formSubtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}