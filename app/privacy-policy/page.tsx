import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Gabriel Falis",
  description:
    "This privacy policy will help you understand how we use and protect the data you provide to us when you visit and use our website.",
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-[700px]">
      <div className="flex flex-col gap-16 md:gap-24 ">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="animate-in text-3xl font-bold tracking-tight">
              Privacy Policy
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="animate-in text-xl font-semibold tracking-tight">
              GENERAL INFORMATION
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              GFCodes Apps are all the Apps released in the AppStore under
              Gabriel Falis personal account. On the most basic level, I value
              your privacy and make decisions in our development to respect it
              to the best of our ability.
            </p>

            <h3 className="animate-in text-xl font-semibold tracking-tight">
              STORAGE AND SYNC
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              All my apps store your data locally on the devices you use them.
              Additionally, data is synced and stored on external servers (my
              own infrastructure), including images on AWS S3 and other data in
              a secure backend database.
            </p>

            <h3 className="animate-in text-xl font-semibold tracking-tight">
              PROTECTION OF CERTAIN PERSONALLY-IDENTIFYING INFORMATION
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              No Personally-Identifying Information is transmitted to external
              locations when using GFCodes Apps. Non-personally identifiable
              information such as device type and operating system version to
              our servers. This is used in aggregate to help facilitate
              development decisions.
            </p>

            <h3 className="animate-in text-xl font-semibold tracking-tight">
              COOKIES
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              A cookie is a string of information that a website stores on a
              visitor&apos;s computer, and that the visitor&apos;s browser provides to the
              website each time the visitor returns. This website identify and
              track visitors, their usage of website, and their website access
              preferences. Visitors who do not wish to have cookies placed on
              their computers should set their browsers to refuse cookies before
              using websites.
            </p>

            <h3 className="animate-in text-xl font-semibold tracking-tight">
              QUESTIONS ABOUT DATA HANDLING
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              If you have a question about this privacy and how your data are
              collected, used and stored when you use GFCodes Apps, please feel
              free to email me at gabrielfalis.codes@gmail.com with the subject
              line “Data handling”.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
