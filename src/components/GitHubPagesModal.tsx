import React, { useState } from 'react';
import { X, Copy, Check, Download, Github, Terminal, CheckCircle2, Globe } from 'lucide-react';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const githubActionYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const manualCliCommands = `# 1. Create a repository on GitHub named 'millis-to-tz':
# https://github.com/new

# 2. Push to your repository:
git push -u origin main

# 3. Enable GitHub Pages in your repo:
# Go to https://github.com/imkathir/millis-to-tz/settings/pages
# Under 'Source', select 'GitHub Actions'
# Your site will go live at: https://imkathir.github.io/millis-to-tz/
`;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  const downloadYamlFile = () => {
    const blob = new Blob([githubActionYaml], { type: 'text/yaml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deploy.yml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0f1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080c14]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans text-white">
                GitHub Pages Hosting & Deployment Guide
              </h3>
              <p className="text-xs font-mono text-slate-400">
                100% Client-Side SPA · Zero server costs · Instant loading
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
          
          {/* Key verification alert */}
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-start gap-3 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 text-white">
                Vite Relative Base Path Verified
              </span>
              <span>
                <code>base: './'</code> is already configured in <code>vite.config.ts</code>. Your app will run seamlessly at either <code>https://&lt;username&gt;.github.io/&lt;repo&gt;/</code> or on a custom apex domain!
              </span>
            </div>
          </div>

          {/* Option 1: Automated GitHub Actions (Recommended) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Option A: Automated GitHub Actions Workflow (Recommended)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadYamlFile}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download deploy.yml</span>
                </button>
                <button
                  onClick={() => copyToClipboard(githubActionYaml, 'yaml')}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedSection === 'yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy YAML</span>
                </button>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-xs">
              <li>In your repo root, create a file: <code className="text-emerald-300">.github/workflows/deploy.yml</code></li>
              <li>Paste the workflow YAML below into that file.</li>
              <li>In GitHub, go to <strong className="text-slate-200">Settings → Pages</strong>, and set <strong className="text-slate-200">Source: GitHub Actions</strong>.</li>
              <li>Every git push to <code className="text-emerald-300">main</code> will automatically build and publish!</li>
            </ol>

            <pre className="p-3.5 bg-[#080c14] border border-slate-800 rounded-lg text-slate-300 text-[11px] overflow-x-auto max-h-52 scrollbar-thin">
              <code>{githubActionYaml}</code>
            </pre>
          </div>

          {/* Option 2: Manual Terminal Commands */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Option B: Manual Build & Git Deployment</span>
              </div>
              <button
                onClick={() => copyToClipboard(manualCliCommands, 'cli')}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSection === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Commands</span>
              </button>
            </div>

            <pre className="p-3.5 bg-[#080c14] border border-slate-800 rounded-lg text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
              <code>{manualCliCommands}</code>
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#080c14] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
