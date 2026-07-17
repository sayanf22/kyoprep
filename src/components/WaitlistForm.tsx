"use client";

import React, { useState } from "react";
import { z } from "zod";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";

const waitlistSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address").max(254, "Email is too long"),
  honeypot: z.string().max(0, "Bot detected")
});

type FormState = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [formState, setFormState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [responseMsg, setResponseMsg] = useState("");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setErrors({});
    setResponseMsg("");

    const data = {
      name,
      email,
      honeypot
    };

    // Client-side validation
    const validationResult = waitlistSchema.safeParse(data);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setFormState("idle");
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormState("success");
        setQueuePosition(result.position);
        setResponseMsg(`Success! You have joined the KyoPrep waitlist.`);
        
        // Confetti explosion
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setFormState("error");
        setResponseMsg(result.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setFormState("error");
      setResponseMsg("Failed to connect to the server. Please try again.");
    }
  };

  if (formState === "success") {
    return (
      <div className="waitlist-card text-center">
        <div className="form-response success" style={{ background: "transparent", border: "none" }}>
          <div className="feature-icon-wrapper" style={{ margin: "0 auto 24px auto", width: "64px", height: "64px" }}>
            <CheckCircle size={32} />
          </div>
          <h3 className="waitlist-title" style={{ fontFamily: "var(--font-lora)", color: "var(--text-primary)" }}>
            Welcome to the KyoPrep Waitlist!
          </h3>
          <p className="waitlist-subtitle" style={{ maxWidth: "500px", margin: "0 auto 24px auto" }}>
            Thank you for signing up, <strong>{name}</strong>. We've registered your email for launch notifications.
          </p>
          
          <div style={{
            background: "linear-gradient(to right, #ecfdf5, #eff6ff)",
            border: "2px dashed var(--primary)",
            borderRadius: "12px",
            padding: "24px",
            display: "inline-block",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", display: "block" }}>
              YOUR WAITLIST POSITION
            </span>
            <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary-hover)", fontFamily: "var(--font-lora)", display: "block", margin: "8px 0" }}>
              #{queuePosition}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              We will notify you at <strong>{email}</strong> when KyoPrep launches.
            </span>
          </div>
          
          <button 
            type="button" 
            className="btn btn-tertiary" 
            style={{ display: "block", margin: "20px auto 0 auto" }}
            onClick={() => {
              setName("");
              setEmail("");
              setFormState("idle");
              setQueuePosition(null);
            }}
          >
            Register another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="waitlist-card">
      <div className="waitlist-header">
        <h2 className="waitlist-title" style={{ fontFamily: "var(--font-lora)" }}>Secure Your Waitlist Spot</h2>
        <p className="waitlist-subtitle">Be the first to know when KyoPrep goes live and get early notifications about exam releases.</p>
      </div>

      <form onSubmit={handleSubmit} className="waitlist-form" noValidate>
        {/* Honeypot Spam Protection */}
        <div className="honeypot-wrapper">
          <label htmlFor="hp-field">Leave this empty</label>
          <input
            id="hp-field"
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name Field */}
        <div className={`form-group ${errors.name ? "invalid" : ""}`}>
          <label htmlFor="name-input" className="form-label">Full Name</label>
          <input
            id="name-input"
            type="text"
            className="form-input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={formState === "loading"}
          />
          {errors.name && <span className="error-msg">{errors.name}</span>}
        </div>

        {/* Email Field */}
        <div className={`form-group ${errors.email ? "invalid" : ""}`}>
          <label htmlFor="email-input" className="form-label">Email Address</label>
          <input
            id="email-input"
            type="email"
            className="form-input"
            placeholder="yourname@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={formState === "loading"}
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>

        {/* Submit Response Message */}
        {formState === "error" && (
          <div style={{ 
            display: "flex", 
            gap: "8px", 
            alignItems: "center", 
            color: "var(--red-alert)", 
            fontSize: "0.85rem", 
            fontWeight: 500, 
            marginBottom: "16px",
            padding: "10px 14px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "8px"
          }}>
            <AlertCircle size={16} />
            <span>{responseMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={formState === "loading"}
        >
          {formState === "loading" ? (
            <>
              <span className="spinner"></span>
              <span>Registering...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Get Notified on Launch</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
