import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizes a single string to defend against XSS, null byte injection, and script execution.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;

  return (
    input
      // Remove null bytes
      .replace(/\0/g, '')
      // Strip script tags and their contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Strip dangerous HTML event handler attributes
      .replace(/on\w+\s*=\s*(["'])?.*?\1/gi, '')
      // Strip javascript: pseudo-protocol URIs
      .replace(/javascript:[^"']*/gi, '')
      // Strip vbscript: pseudo-protocol URIs
      .replace(/vbscript:[^"']*/gi, '')
      // Strip data:text/html URIs
      .replace(/data:text\/html[^"']*/gi, '')
      // Normalize whitespace
      .trim()
  );
}

/**
 * Recursively traverses an object/array and sanitizes all string properties.
 * Also safeguards against prototype pollution attacks.
 */
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      // Prototype pollution defense: ignore prototype-altering keys
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      cleaned[key] = sanitizeData(value);
    }
    return cleaned;
  }

  return data;
}

/**
 * Express middleware that automatically cleans and sanitizes request payloads.
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeData(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeData(req.params);
  }

  next();
}
