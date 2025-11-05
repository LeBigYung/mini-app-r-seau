"use client";
import { useState, useRef, useEffect } from "react";
import autoAnimate from "@formkit/auto-animate";

export default function Test() {
  const [open, setOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (parentRef.current) autoAnimate(parentRef.current);
  }, []);

  return (
    <div
      ref={parentRef}
      className="max-w-md mx-auto mt-20 p-4 border rounded flex flex-col space-y-4"
    >
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Toggle Form
      </button>

      {open && (
        <form className="p-4 border rounded bg-gray-50">
          <input className="border p-2 w-full" placeholder="Nom du job..." />
        </form>
      )}
    </div>
  );
}
