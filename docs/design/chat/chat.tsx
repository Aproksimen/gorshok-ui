import { Icon } from "@iconify/react";

export function Chat() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-8 select-none z-0">
        <img
          src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/ucg0j3LVwe3/ai/image-HcB9fy9jrlL.png"
          alt="GORSHOK Logo"
          className="w-64 max-w-[70vw] object-contain opacity-[0.14] mix-blend-multiply drop-shadow-sm"
        />
      </div>
      <header className="relative z-10 h-[82px] shrink-0 bg-card/95 backdrop-blur-md border-b border-border flex items-center gap-3 px-5 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="size-10 shrink-0 rounded-full bg-muted overflow-hidden border border-border/80 flex items-center justify-center">
            <img
              src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/ucg0j3LVwe3/ai/image-HcB9fy9jrlL.png"
              alt="GORSHOK"
              className="size-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-[17px] font-semibold tracking-[-0.02em] truncate">
              Подбор компрессора
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground truncate">GORSHOK · Онлайн</span>
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10 flex-1 overflow-y-auto px-5 pt-7 pb-36">
        <div className="flex items-start gap-3">
          <div className="size-10 shrink-0 rounded-full overflow-hidden border border-border shadow-sm bg-card">
            <img
              src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/ucg0j3LVwe3/ai/image-HcB9fy9jrlL.png"
              alt="GORSHOK AI"
              className="size-full object-cover"
            />
          </div>
          <div className="max-w-[calc(100%-3.25rem)]">
            <div className="rounded-[20px] rounded-tl-sm bg-card px-5 py-4 shadow-[0_8px_24px_rgba(28,52,74,0.07)] border border-border/40">
              <p className="text-[15px] leading-relaxed text-foreground">
                Здравствуйте! Опишите вашу задачу, и я подберу подходящий компрессор.
              </p>
            </div>
            <span className="block text-[11px] text-muted-foreground mt-2 ml-1">Только что</span>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border px-5 pt-3 pb-6 z-20">
        <div className="flex items-center gap-2 rounded-full bg-input border border-border/70 p-1.5 pl-4 shadow-sm">
          <button
            aria-label="Прикрепить файл"
            className="text-muted-foreground flex items-center justify-center size-9 hover:text-foreground transition-colors"
          >
            <Icon icon="solar:paperclip-linear" width={20} height={20} />
          </button>
          <input
            aria-label="Ваш запрос"
            className="min-w-0 flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground"
            placeholder="Введите ваш запрос..."
          />
          <button
            aria-label="Отправить"
            className="size-11 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_5px_14px_rgba(22,168,120,0.28)] active:scale-95 transition-transform"
          >
            <Icon icon="solar:plain-3-bold" width={20} height={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
