/* Make Your Own: no backend, device writes, telemetry or AI requests.
   All file inspection happens locally and only samples a header. */
(function (root) {
  "use strict";

  const PLATFORMS = {
    gb: {
      name: "Game Boy / Color", extension: ".gb or .gbc", examples: [
        { name: "GB Studio", type: "Visual editor + starter project", url: "https://www.gbstudio.dev/", note: "Create a project, build, and export a .gb ROM." },
        { name: "GBDK-2020", type: "Code-first C toolchain", url: "https://github.com/gbdk-2020/gbdk-2020", note: "Use its examples and build a Game Boy ROM." },
        { name: "Homebrew Hub", type: "Open homebrew discovery", url: "https://hh.gbdev.io/", note: "Find original games and investigate their published source/license." },
      ],
      targets: [
        { id: "sd", name: "SD flash cartridge", connect: "Identify the exact GB/GBC flash cartridge model. Power off the console, remove the microSD card and connect it to your computer using an SD reader.", transfer: ["Read your flash cartridge manual and verify the supported ROM format, SD format and system folder.", "Back up the SD card, including saves and firmware files.", "Copy your exported .gb or .gbc to the game folder specified by your cartridge maker.", "Safely eject the card, reinsert it and boot the cartridge on your Game Boy."], docs: "https://everdrive.me/cartridges/edgbx7.html", caution: "EverDrive is an example, not a universal guide. Other flash cartridges have different instructions." },
        { id: "writer", name: "Writable flash cartridge + programmer", connect: "Identify the exact writable cartridge and its supported programmer. Connect the programmer to your computer; do not connect an original Game Boy expecting USB access.", transfer: ["Confirm the cartridge mapper/MBC, ROM size, voltage and save-memory compatibility in the programmer documentation.", "Back up the writable cartridge and any save data with the vendor's tool.", "Using the matching programmer software, select your compiled ROM and write only to a cartridge you own and can safely overwrite.", "Verify the write using the programmer's readback or verification feature, then test in the console."], docs: "https://learn.adafruit.com/homebrew-game-boy-games/cartridge-flashing", caution: "Ordinary retail cartridges are generally not rewritable. A supported cart and hardware programmer are required." },
        { id: "emulator", name: "Emulator first", connect: "No physical console connection is needed. Install a Game Boy-compatible emulator on your computer.", transfer: ["Export a .gb or .gbc from your toolchain.", "Open it locally in a compatible emulator and test input, audio, save and reset behavior.", "Keep a known-good ROM backup before attempting physical hardware."], docs: "https://www.retroarch.com/", caution: "An emulator is a test path, not a cartridge installation." },
      ],
    },
    nes: {
      name: "NES / Famicom", extension: ".nes", examples: [
        { name: "NESdev", type: "Documentation and community", url: "https://www.nesdev.org/", note: "Start with the wiki, examples and mapper documentation." },
        { name: "cc65", type: "C compiler and assembler", url: "https://cc65.github.io/", note: "Create an original NES game and produce a .nes file." },
      ],
      targets: [
        { id: "sd", name: "Compatible NES flash cartridge", connect: "Identify your NES/Famicom model and your flash cartridge. Remove the SD card and use an SD reader.", transfer: ["Verify the flash cartridge supports your ROM's mapper, region and .nes format.", "Back up the SD card and save files.", "Copy the .nes file following the cartridge manufacturer's instructions.", "Safely eject the SD card, then test on your NES or Famicom."], docs: "https://www.nesdev.org/wiki/NES_2.0", caution: "Mapper/board compatibility matters. Never flash an unknown retail cartridge." },
        { id: "emulator", name: "Emulator first", connect: "Use a compatible NES emulator on your computer. No physical device connection is required.", transfer: ["Build the .nes file.", "Open it in a NES emulator that supports its header and mapper.", "Verify controls, audio, reset, saves and region behavior."], docs: "https://www.retroarch.com/", caution: "An emulator does not install a game onto real hardware." },
      ],
    },
    pico: {
      name: "PICO-8", extension: ".p8 or .p8.png", examples: [
        { name: "PICO-8", type: "Fantasy console and editor", url: "https://www.lexaloffle.com/pico-8.php", note: "Use its built-in code, sprite, sound and map editors." },
        { name: "Lexaloffle BBS", type: "Example carts and community", url: "https://www.lexaloffle.com/bbs/?cat=7", note: "Browse public carts; respect each author's license before reusing code." },
      ],
      targets: [
        { id: "runtime", name: "PICO-8 runtime", connect: "PICO-8 is a fantasy console, not a Game Boy cartridge. Open the PICO-8 application or its supported web player.", transfer: ["Create or modify a cart in PICO-8 and save it as a supported .p8 / .p8.png file.", "Load your cart into PICO-8, or use the platform's documented export/share route.", "Test buttons, sound and performance in the runtime."], docs: "https://www.lexaloffle.com/pico-8.php", caution: "Do not insert .p8 carts into a Game Boy/NES cartridge." },
      ],
    },
    tic: {
      name: "TIC-80", extension: ".tic", examples: [
        { name: "TIC-80", type: "Free/open-source fantasy console", url: "https://tic80.com/", note: "Create a new cart using the built-in code, map, sprite and audio tools." },
        { name: "TIC-80 learn", type: "Commands and examples", url: "https://tic80.com/learn", note: "Learn load, save, run, export and cart format." },
      ],
      targets: [
        { id: "runtime", name: "TIC-80 runtime", connect: "No physical cartridge is required. Open TIC-80 in a browser or the desktop application.", transfer: ["Save the project as a .tic cartridge.", "Load it in TIC-80 and run it.", "Export a supported standalone or HTML build only if your distribution needs it."], docs: "https://tic80.com/learn", caution: "A TIC-80 cartridge file is not a ROM for physical legacy consoles." },
      ],
    },
    arduboy: {
      name: "Arduboy", extension: ".hex or .arduboy", examples: [
        { name: "Arduboy Quick Start", type: "Official development guide", url: "https://www.arduboy.com/quick-start", note: "Configure Arduino tools and the Arduboy2 library." },
        { name: "Arduboy community", type: "Open-source examples", url: "https://community.arduboy.com/", note: "Find projects and games with available source code." },
      ],
      targets: [
        { id: "usb", name: "Arduboy over USB", connect: "Connect your Arduboy with a DATA-capable micro-USB cable. Identify the specific Arduboy model, supported uploader and board/port.", transfer: ["Use the official Arduboy workflow to build a .hex or obtain a compatible .arduboy package.", "Back up saves or FX flash data where your specific model and tool support it.", "Open a trusted Arduino/uploader tool, confirm the exact board, port and file, then upload with that tool.", "Disconnect safely and run the game on the Arduboy."], docs: "https://www.arduboy.com/quick-start", caution: "The site does not request USB permissions or upload firmware. Wrong targets and erased saves can cause data loss." },
        { id: "emulator", name: "Emulator first", connect: "No USB connection needed. Use a compatible Arduboy emulator.", transfer: ["Compile a compatible Arduboy game artifact.", "Load it into the emulator and verify buttons and rendering.", "Only then choose a supported device uploader if you want to play on hardware."], docs: "https://www.arduboy.com/emulator", caution: "An emulator is not a hardware upload." },
      ],
    },
  };

  function profile(id) { return PLATFORMS[id] || PLATFORMS.gb; }
  function targetFor(platform, id) { return profile(platform).targets.find(function (item) { return item.id === id; }) || profile(platform).targets[0]; }
  function extAllowed(platform, fileName) {
    const lower = String(fileName || "").toLowerCase();
    const allowed = { gb: /\.(gb|gbc)$/, nes: /\.nes$/, pico: /\.(p8|p8\.png)$/, tic: /\.tic$/, arduboy: /\.(hex|arduboy)$/ };
    return allowed[platform] ? allowed[platform].test(lower) : false;
  }
  function bytesToHex(n) { return "0x" + Number(n || 0).toString(16).toUpperCase().padStart(2, "0"); }

  // Header-only heuristics, deliberately not a full integrity, authenticity or hardware safety check.
  function inspectBytes(platform, bytes, fileName, size) {
    const p = profile(platform);
    const data = bytes || [];
    const total = Number.isFinite(size) ? size : data.length;
    const details = ["File: " + (fileName || "(unnamed)"), "Size: " + total.toLocaleString("en-US") + " bytes"];
    if (!extAllowed(platform, fileName)) {
      return { level: "error", summary: "This file extension does not match " + p.name + ".", details: details.concat(["Expected " + p.extension + ". Choose the right platform or export a compatible build."]) };
    }
    if (total === 0) return { level: "error", summary: "The file is empty.", details: details };
    if (platform === "gb") {
      if (total < 0x150 || data.length < 0x150) return { level: "error", summary: "This Game Boy file is too small for a cartridge header.", details: details };
      const mark = data[0x104] === 0xce && data[0x105] === 0xed && data[0x106] === 0x66 && data[0x107] === 0x66;
      const title = Array.from(data.slice(0x134, 0x144)).filter(function (b) { return b >= 32 && b <= 126; }).map(function (b) { return String.fromCharCode(b); }).join("").trim();
      details.push("Title bytes: " + (title || "(not readable)"));
      details.push("Cartridge type: " + bytesToHex(data[0x147]) + "; ROM size code: " + bytesToHex(data[0x148]));
      details.push("Nintendo header mark: " + (mark ? "present" : "missing/unrecognized"));
      return { level: mark ? "ok" : "warn", summary: mark ? "Game Boy header recognized. Compatibility still needs checking." : "Game Boy extension found, but the expected header mark is missing.", details: details };
    }
    if (platform === "nes") {
      const valid = data.length >= 16 && data[0] === 0x4e && data[1] === 0x45 && data[2] === 0x53 && data[3] === 0x1a;
      if (!valid) return { level: "warn", summary: "Expected an iNES/NES 2.0 header, but none was recognized.", details: details };
      const nes2 = (data[7] & 0x0c) === 0x08;
      const mapper = ((data[6] >> 4) | (data[7] & 0xf0));
      details.push((nes2 ? "NES 2.0" : "iNES") + " header; mapper low bits: " + mapper);
      details.push("PRG banks: " + data[4] + "; CHR banks: " + data[5] + ". Full mapper compatibility not checked.");
      return { level: "ok", summary: "NES header recognized. Check mapper support before transferring.", details: details };
    }
    if (platform === "arduboy" && String(fileName).toLowerCase().endsWith(".hex")) {
      if (data[0] !== 0x3a) return { level: "warn", summary: "A .hex file was selected, but it does not start like Intel HEX.", details: details };
    }
    details.push("Extension matches " + p.name + ". File contents and device compatibility have not been verified.");
    return { level: "warn", summary: "Format name matches, but this is not a complete validation.", details: details };
  }

  function buildPrompt(platform, targetId, device, result, notes) {
    const p = profile(platform), target = targetFor(platform, targetId);
    const analysis = result ? [result.summary].concat(result.details).join("\n") : "No game file inspected yet.";
    return [
      "You are my cautious homebrew game development and hardware compatibility assistant.",
      "Platform: " + p.name,
      "Target: " + target.name,
      "My exact device/cart/programmer details: " + (String(device || "").trim() || "(not provided; ask me before making hardware-specific claims)"),
      "Read-only device inspection notes (unverified, supplied by user): " + (String(notes || "").trim() || "(none; explain safe read-only ways to identify the device model, port and firmware)"),
      "Local file inspection (header/extension only, not proof of safety):\n" + analysis,
      "Official starting documentation: " + target.docs,
      "Help me: (1) locate a legitimately reusable starter/template and confirm its license; (2) build my own original game; (3) verify file format, size, mapper/board and exact model compatibility; (4) back up saves and existing files; (5) give reversible, device-specific transfer steps; (6) test on an emulator then on hardware.",
      "Never assume USB access, promise direct AI flashing, or run erase/write commands without my explicit confirmation. If hardware details or documentation are insufficient, stop and ask. Avoid copyrighted game ROMs.",
    ].join("\n\n");
  }

  root.AHGMake = { PLATFORMS: PLATFORMS, profile: profile, targetFor: targetFor, extAllowed: extAllowed, inspectBytes: inspectBytes, buildPrompt: buildPrompt };
})(typeof window !== "undefined" ? window : globalThis);
