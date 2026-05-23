import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToolCard from '../components/ToolCard';

// ── Shared mock data ─────────────────────────────────────────────────────────
const mockTool = {
  id: 1,
  name: 'SuperAI',
  tagline: 'The future of AI tooling',
  description: 'SuperAI helps you automate workflows with cutting-edge ML models.',
  website: 'https://superai.example.com',
  topics: ['AI', 'Automation', 'ML'],
  date: '2025-05-11',
  created_at: '2025-05-11T00:00:00Z',
  trending_score: 95,
  votes: 420,
};

// ── Tests ────────────────────────────────────────────────────────────────────
describe('ToolCard', () => {
  it('renders the tool name and tagline', () => {
    render(
      <ToolCard
        tool={mockTool}
        isSaved={false}
        onToggleSave={vi.fn()}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('SuperAI')).toBeInTheDocument();
    expect(screen.getByText('The future of AI tooling')).toBeInTheDocument();
  });

  it('shows the Trending badge when score > 80', () => {
    render(
      <ToolCard
        tool={mockTool}
        isSaved={false}
        onToggleSave={vi.fn()}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText(/trending/i)).toBeInTheDocument();
  });

  it('does NOT show the Trending badge when score ≤ 80', () => {
    const lowScoreTool = { ...mockTool, trending_score: 50 };
    render(
      <ToolCard
        tool={lowScoreTool}
        isSaved={false}
        onToggleSave={vi.fn()}
        onClick={vi.fn()}
      />
    );
    expect(screen.queryByText(/trending/i)).not.toBeInTheDocument();
  });

  it('renders all topic tags', () => {
    render(
      <ToolCard
        tool={mockTool}
        isSaved={false}
        onToggleSave={vi.fn()}
        onClick={vi.fn()}
      />
    );
    mockTool.topics.forEach((topic) => {
      expect(screen.getByText(topic)).toBeInTheDocument();
    });
  });

  it('calls onToggleSave with the tool id when the bookmark button is clicked', () => {
    const onToggleSave = vi.fn();
    render(
      <ToolCard
        tool={mockTool}
        isSaved={false}
        onToggleSave={onToggleSave}
        onClick={vi.fn()}
      />
    );
    // Bookmark button is the first button rendered
    const bookmarkBtn = screen.getAllByRole('button')[0];
    fireEvent.click(bookmarkBtn);
    expect(onToggleSave).toHaveBeenCalledWith(mockTool.id);
  });

  it('renders "Visit Website" link pointing to the tool website', () => {
    render(
      <ToolCard
        tool={mockTool}
        isSaved={false}
        onToggleSave={vi.fn()}
        onClick={vi.fn()}
      />
    );
    const link = screen.getByRole('link', { name: /visit website/i });
    expect(link).toHaveAttribute('href', mockTool.website);
  });
});
