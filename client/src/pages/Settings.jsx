import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Palette,
} from "lucide-react";

function Settings({ user }) {
  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center gap-2">
          <SettingsIcon
            size={19}
            className="text-[#BD7B24]"
          />

          <h1 className="text-xl font-semibold text-[#22201A]">
            Settings
          </h1>
        </div>

        <p className="mt-1.5 text-xs text-[#8A8473]">
          Manage your DocMind preferences.
        </p>

        <div className="mt-8 space-y-4">
          <section className="rounded-2xl border border-[#E6E1D3] bg-white p-5">
            <div className="flex items-center gap-3">
              <User
                size={17}
                className="text-[#BD7B24]"
              />

              <div>
                <h2 className="text-sm font-semibold text-[#22201A]">
                  Account
                </h2>

                <p className="mt-1 text-[10px] text-[#8A8473]">
                  Your account information.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-[#F7F4EC] px-4 py-3">
              <p className="text-[9px] uppercase tracking-wide text-[#8A8473]">
                Name
              </p>

              <p className="mt-1 text-xs font-medium text-[#22201A]">
                {user?.name || "User"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E6E1D3] bg-white p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={17}
                className="text-[#BD7B24]"
              />

              <div>
                <h2 className="text-sm font-semibold text-[#22201A]">
                  Privacy
                </h2>

                <p className="mt-1 text-[10px] text-[#8A8473]">
                  Your research sources are private to your account.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E6E1D3] bg-white p-5">
            <div className="flex items-center gap-3">
              <Palette
                size={17}
                className="text-[#BD7B24]"
              />

              <div>
                <h2 className="text-sm font-semibold text-[#22201A]">
                  Appearance
                </h2>

                <p className="mt-1 text-[10px] text-[#8A8473]">
                  Appearance preferences will be available here.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;