/**
 * 🎸 Funee Demo: GitHub Repository Stats
 * 
 * Fetches top TypeScript repos from GitHub, processes them with
 * async iterables, and generates a formatted report.
 */

import { log } from "host://console";
import { httpGetJSON } from "host://http";
import { writeFile } from "host://fs";
import { map, toArray, fromArray } from "funee";

// Types
type GithubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  html_url: string;
};

type SearchResponse = {
  total_count: number;
  items: GithubRepo[];
};

type RepoSummary = {
  name: string;
  stars: string;
  forks: number;
  issues: number;
  url: string;
};

// Functional helpers
const formatStars = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
};

const toSummary = (repo: GithubRepo): RepoSummary => ({
  name: repo.full_name,
  stars: formatStars(repo.stargazers_count),
  forks: repo.forks_count,
  issues: repo.open_issues_count,
  url: repo.html_url,
});

const formatReport = (repos: RepoSummary[]): string => {
  const lines = [
    "# Top TypeScript Repositories on GitHub",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Repository | ⭐ Stars | 🍴 Forks | 🐛 Issues |",
    "|------------|---------|---------|----------|",
  ];
  
  for (const repo of repos) {
    lines.push(`| [${repo.name}](${repo.url}) | ${repo.stars} | ${repo.forks} | ${repo.issues} |`);
  }
  
  return lines.join("\n");
};

// Main script
export default async () => {
  log("🔍 Fetching top TypeScript repositories from GitHub...");
  log("");

  // Fetch repos from GitHub API
  const response = await httpGetJSON<SearchResponse>({
    target: { url: "https://api.github.com/search/repositories?q=language:typescript&sort=stars&per_page=30" }
  });

  log(`📊 Found ${response.total_count.toLocaleString()} TypeScript repos total`);
  log("");

  // Filter to 10k+ stars and take top 10
  const filtered = response.items
    .filter((repo) => repo.stargazers_count > 10000)
    .slice(0, 10);

  // Process with async iterables pipeline - transform to summaries
  const topRepos = await toArray(
    map(
      fromArray(filtered),
      toSummary
    )
  );

  // Display results
  log("🏆 Top 10 TypeScript Repos (10k+ stars):");
  log("─".repeat(50));
  
  for (const repo of topRepos) {
    log(`⭐ ${repo.stars.padStart(6)} │ ${repo.name}`);
  }
  
  log("─".repeat(50));
  log("");

  // Generate and save report
  const report = formatReport(topRepos);
  await writeFile("./github-stats-report.md", report);
  log("📝 Report saved to ./github-stats-report.md");
  
  log("");
  log("✨ Done!");

  return topRepos;
};
