import { Metadata } from "next";
import Form from "./components/Form";

export const metadata: Metadata = {
  title: "Support | Gabriel Falis",
  description:
    "If you want to provide feedback or ask a question, this is the place to do it!",
};

export default function Support() {
  return (
    <div className="mx-auto max-w-[700px]">
      <div className="flex flex-col gap-16 md:gap-24 ">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="animate-in text-3xl font-bold tracking-tight">
              Support
            </h1>
            <p
              className="animate-in text-secondary"
              style={{ "--index": 1 } as React.CSSProperties}
            >
              If you would like to provide feedback or are looking for support,
              you can use the form below or email me at
              gabrielfalis.codes@gmail.com.
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-5 flex animate-in"
        style={{ "--index": 2 } as React.CSSProperties}
      >
        <Form />
      </div>
    </div>
  );
}
