#!/usr/bin/env node

/**
 * Test script to reproduce the header search issue
 */

import { spawn } from "child_process";
import fetch from "node-fetch";
import { readFile } from "fs/promises";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testHeaderSearchIssue() {
  console.log("🐛 Testing header search issues...\n");

  try {
    // Test 1: Simulate rapid consecutive searches
    console.log("1️⃣ Testing rapid consecutive searches...");

    const cities = ["Tokyo", "London", "New York", "Paris"];

    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      console.log(`   Searching for: ${city}`);

      const response = await fetch(
        `http://localhost:8000/api/weather/current/city/${encodeURIComponent(
          city
        )}?units=metric`
      );

      if (!response.ok) {
        console.log(`   ❌ Search ${i + 1} failed: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log(
        `   ✅ Search ${i + 1} succeeded: ${
          data.data?.location?.name || "Unknown"
        }`
      );

      // Short delay between searches
      await delay(100);
    }

    console.log("\n2️⃣ Testing search state persistence...");

    // Test the current header implementation by reading the file
    const headerContent = await readFile(
      "/Users/tavong/Desktop/Folio Weather (Weather API App)/frontend/src/components/layout/Header.jsx",
      "utf-8"
    );

    // Look for potential issues in the code
    const issues = [];

    // Check for potential race conditions
    if (
      headerContent.includes("setTimeout") &&
      headerContent.includes("setIsSearching")
    ) {
      issues.push(
        "⚠️  Potential race condition with setTimeout and search state"
      );
    }

    // Check for aggressive state resets
    if (
      headerContent.includes("setIsSearchActive(false)") &&
      headerContent.includes("setTimeout")
    ) {
      issues.push(
        "⚠️  Aggressive state reset that might interfere with multiple searches"
      );
    }

    // Check for missing error recovery
    if (
      !headerContent.includes("catch") ||
      !headerContent.includes("finally")
    ) {
      issues.push("⚠️  Missing comprehensive error recovery");
    }

    if (issues.length > 0) {
      console.log("   Issues found:");
      issues.forEach((issue) => console.log(`   ${issue}`));
    } else {
      console.log("   ✅ No obvious issues found in header code");
    }

    console.log("\n🎯 Issue Analysis Complete!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testHeaderSearchIssue().catch(console.error);
