import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms Of Service | Gabriel Falis",
  description:
    "This terms of service will help you understand how we use and protect the data you provide to us when you visit and use our website.",
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-[700px]">
      <div className="flex flex-col gap-16 md:gap-24 ">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="animate-in text-3xl font-bold tracking-tight">
              Terms Of Service
            </h1>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              These terms of service (“Terms”) apply to your access and use of
              all Gabriel Falis apps and services, including iOS apps and web
              services (the “Service”). Please read them carefully.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="animate-in text-xl font-semibold tracking-tight">
              Accepting these Terms
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
              Privacy Policy
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              For information about how we collect and use information about
              users of the Service, please check out our privacy policy
              available at: https://www.gfcodes.com/privacy-policy/
            </p>

            <h3 className="animate-in text-xl font-semibold tracking-tight">
              Third-Party Services
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              From time to time, we may provide you with links to third party
              websites or services that we do not own or control. Your use of
              the Service may also include the use of applications that are
              developed or owned by a third party. Your use of such third party
              applications, websites, and services is governed by that party’s
              own terms of service or privacy policies. We encourage you to read
              the terms and conditions and privacy policy of any third party
              application, website or service that you visit or use.
            </p>

            <h3 className="animate-in text-xl font-semibold tracking-tight">
              Creating Accounts
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              When you create an account or use another service to log in to the
              Service, you agree to maintain the security of your password and
              accept all risks of unauthorized access to any data or other
              information you provide to the Service. If you discover or suspect
              any Service security breaches, please let us know as soon as
              possible.
            </p>

            <h3 className="animate-in text-xl font-semibold tracking-tight">
              Unavoidable Legal Stuff
            </h3>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              THE SERVICE AND ANY OTHER SERVICE AND CONTENT INCLUDED ON OR
              OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICE ARE PROVIDED
              TO YOU ON AN AS IS OR AS AVAILABLE BASIS WITHOUT ANY
              REPRESENTATIONS OR WARRANTIES OF ANY KIND. WE DISCLAIM ANY AND ALL
              WARRANTIES AND REPRESENTATIONS (EXPRESS OR IMPLIED, ORAL OR
              WRITTEN) WITH RESPECT TO THE SERVICE AND CONTENT INCLUDED ON OR
              OTHERWISE MADE AVAILABLE TO YOU THROUGH THE SERVICE WHETHER
              ALLEGED TO ARISE BY OPERATION OF LAW, BY REASON OF CUSTOM OR USAGE
              IN THE TRADE, BY COURSE OF DEALING OR OTHERWISE. IN NO EVENT WILL
              Aivars Meijers BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY
              SPECIAL, INDIRECT, INCIDENTAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES
              OF ANY KIND ARISING OUT OF OR IN CONNECTION WITH THE SERVICE OR
              ANY OTHER SERVICE AND/OR CONTENT INCLUDED ON OR OTHERWISE MADE
              AVAILABLE TO YOU THROUGH THE SERVICE, REGARDLESS OF THE FORM OF
              ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY OR OTHERWISE,
              EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES OR
              ARE AWARE OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY
              FOR ALL CAUSES OF ACTION AND UNDER ALL THEORIES OF LIABILITY WILL
              BE LIMITED TO THE AMOUNT YOU PAID TO Aivars Meijers. THIS SECTION
              WILL BE GIVEN FULL EFFECT EVEN IF ANY REMEDY SPECIFIED IN THIS
              AGREEMENT IS DEEMED TO HAVE FAILED OF ITS ESSENTIAL PURPOSE. You
              agree to defend, indemnify and hold us harmless from and against
              any and all costs, damages, liabilities, and expenses (including
              attorneys fees, costs, penalties, interest and disbursements) we
              incur in relation to, arising from, or for the purpose of
              avoiding, any claim or demand from a third party relating to your
              use of the Service or the use of the Service by any person using
              your account, including any claim that your use of the Service
              violates any applicable law or regulation, or the rights of any
              third party, and/or your violation of these Terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
