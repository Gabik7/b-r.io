"use client";

import clsx from "clsx";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

export default function Form() {
  const formRef = useRef<HTMLFormElement>(null);
  const [contentValid, setContentValid] = useState("");

  let params = useParams<{ topic: string }>();

  function sendEmail(formData: FormData) {
    fetch("/api/email", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        name: `${formData.get("firstName")} ${formData.get("lastName")}`,
        message: formData.get("content"),
      }),
    });
  }

  return (
    <form
      className="flex w-full flex-col items-start justify-between gap-6 py-1.5"
      ref={formRef}
      action={async (formData) => {
        sendEmail(formData);
        formRef.current?.reset();
        setContentValid("");
      }}
    >
      <div className="flex w-full items-center gap-1.5">
        <input
          required
          name="firstName"
          type="text"
          placeholder={"First Name"}
          className="w-1/2 bg-inherit text-primary outline-none placeholder:text-tertiary"
          onChange={(e) => setContentValid(e.target.value)}
        />

        <input
          required
          name="lastName"
          type="text"
          placeholder={"Last Name"}
          className="w-1/2 bg-inherit text-primary outline-none placeholder:text-tertiary"
          onChange={(e) => setContentValid(e.target.value)}
        />
      </div>

      <div className="flex w-full items-center gap-1.5  ">
        <input
          required
          name="email"
          type="email"
          placeholder={"Email"}
          className="w-full bg-inherit text-primary outline-none placeholder:text-tertiary"
          onChange={(e) => setContentValid(e.target.value)}
        />
      </div>

      <textarea
        required
        name="content"
        placeholder={"Message"}
        className="my-3 h-auto max-h-52 w-full flex-1 resize-none bg-inherit leading-tight text-primary outline-none placeholder:text-tertiary"
        rows={3}
        maxLength={300}
        onInput={(event) => {
          event.currentTarget.style.height = "auto";
          event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
        }}
        onChange={(e) => setContentValid(e.target.value)}
      />

      <button
        className={clsx(
          "mt-1.5 flex h-fit w-fit items-center justify-center rounded-full bg-[var(--blue-10)] px-3 py-1.5 text-sm text-white transition-all disabled:bg-secondary disabled:font-normal disabled:text-tertiary",
        )}
        type="submit"
        disabled={contentValid === ""}
      >
        Submit
      </button>
    </form>
  );
}
