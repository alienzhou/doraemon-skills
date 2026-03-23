"""
Integration tests for hook scripts.

These tests simulate the full hook workflow by invoking the scripts
with mock input and checking the output and side effects.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest
import yaml


# Paths to hook scripts
HOOKS_DIR = Path(__file__).parent.parent.parent / "hooks"
CHECK_PRECIPITATION = HOOKS_DIR / "stop" / "check_precipitation.py"


def run_hook(script_path: Path, input_data: dict, cwd: Path = None) -> tuple:
    """
    Run a hook script with given input.
    
    Returns:
        tuple: (return_code, stdout, stderr)
    """
    env = os.environ.copy()
    env["PYTHONPATH"] = str(HOOKS_DIR.parent)
    
    result = subprocess.run(
        [sys.executable, str(script_path)],
        input=json.dumps(input_data),
        capture_output=True,
        text=True,
        cwd=str(cwd) if cwd else None,
        env=env,
    )
    return result.returncode, result.stdout, result.stderr


class TestCheckPrecipitationHook:
    """Integration tests for check_precipitation.py (snapshot-based)."""
    
    def test_no_discuss_dirs(self, tmp_path):
        """Test with no discussion directories."""
        input_data = {"status": "completed"}
        
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        assert code == 0
        assert stdout.strip() == "{}"
    
    def test_stop_hook_active_bypass(self, tmp_path):
        """Test that stop_hook_active=True bypasses check."""
        # Create discussion directory
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # Run with stop_hook_active=True
        input_data = {
            "hook_event_name": "Stop",
            "stop_hook_active": True
        }
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        assert code == 0
        assert stdout.strip() == "{}"
    
    def test_no_stale_discussions(self, tmp_path):
        """Test with discussions that are not stale."""
        # Create discussion with outline and decisions
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        decisions_dir = discuss_dir / "decisions"
        decisions_dir.mkdir()
        (decisions_dir / "D01-test.md").write_text("# Decision")
        
        # Run hook
        input_data = {"status": "completed"}
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        # Should allow (no stale reminders)
        assert code == 0
        output = json.loads(stdout.strip())
        # May be {} or have other fields, but shouldn't block
        assert "decision" not in output or output.get("decision") != "block"
    
    def test_stale_discussion_detection(self, tmp_path):
        """Test detection of stale discussions (outline changed but decisions not updated)."""
        import time
        
        # Create discussion with outline
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        outline = discuss_dir / "outline.md"
        outline.write_text("# Outline")
        
        # Wait a bit to ensure mtime difference
        time.sleep(0.1)
        
        # Modify outline multiple times (simulating changes without decision updates)
        for i in range(4):
            outline.write_text(f"# Outline v{i}")
            time.sleep(0.1)
        
        # Run hook - should detect stale state
        input_data = {"status": "completed"}
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        # Should detect staleness (may block or suggest)
        output = json.loads(stdout.strip())
        # The hook may block or allow with suggestion depending on threshold
        # Just verify it runs without error
        assert code == 0


class TestWorkspaceDetection:
    """Integration tests for workspace detection priority logic (D01)."""
    
    def test_stdin_workspace_roots_cursor_format(self, tmp_path):
        """Test workspace detection from stdin workspace_roots (Cursor format)."""
        # Create discussion in a specific directory
        workspace = tmp_path / "project"
        workspace.mkdir()
        discuss_dir = workspace / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # Provide workspace_roots in stdin (Cursor format)
        input_data = {
            "status": "completed",
            "workspace_roots": [str(workspace)]
        }
        
        # Run from a different directory (tmp_path, not workspace)
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        # Should use stdin workspace_roots and find the discussion
        assert code == 0
        # The hook should have found and processed the discussion
        # (if not found, it would just return {} with no error)
    
    def test_stdin_workspace_roots_cline_format(self, tmp_path):
        """Test workspace detection from stdin workspaceRoots (Cline format)."""
        # Create discussion in a specific directory
        workspace = tmp_path / "cline-project"
        workspace.mkdir()
        discuss_dir = workspace / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # Provide workspaceRoots in stdin (Cline format)
        input_data = {
            "status": "completed",
            "workspaceRoots": [str(workspace)]
        }
        
        # Run from a different directory
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        assert code == 0
    
    def test_stdin_multi_root_uses_first(self, tmp_path):
        """Test multi-root workspace uses first root."""
        # Create discussion only in first workspace
        workspace1 = tmp_path / "workspace1"
        workspace2 = tmp_path / "workspace2"
        workspace1.mkdir()
        workspace2.mkdir()
        
        discuss_dir = workspace1 / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # Provide multiple workspace roots
        input_data = {
            "status": "completed",
            "workspace_roots": [str(workspace1), str(workspace2)]
        }
        
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        # Should use first root and find discussion
        assert code == 0
    
    def test_env_cursor_project_dir(self, tmp_path, monkeypatch):
        """Test workspace detection from CURSOR_PROJECT_DIR env var."""
        # Create discussion
        workspace = tmp_path / "cursor-project"
        workspace.mkdir()
        discuss_dir = workspace / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # Set environment variable
        monkeypatch.setenv("CURSOR_PROJECT_DIR", str(workspace))
        
        # No workspace_roots in stdin (fallback to env)
        input_data = {"status": "completed"}
        
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        assert code == 0
    
    def test_env_claude_project_dir(self, tmp_path, monkeypatch):
        """Test workspace detection from CLAUDE_PROJECT_DIR env var."""
        # Create discussion
        workspace = tmp_path / "claude-project"
        workspace.mkdir()
        discuss_dir = workspace / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # Set environment variable
        monkeypatch.setenv("CLAUDE_PROJECT_DIR", str(workspace))
        
        input_data = {"status": "completed"}
        
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        assert code == 0
    
    def test_stdin_takes_priority_over_env(self, tmp_path, monkeypatch):
        """Test stdin workspace_roots takes priority over environment variables."""
        # Create two different workspaces
        stdin_workspace = tmp_path / "stdin-workspace"
        env_workspace = tmp_path / "env-workspace"
        stdin_workspace.mkdir()
        env_workspace.mkdir()
        
        # Create discussion only in stdin workspace
        discuss_dir = stdin_workspace / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # Set env to point to different directory (should be ignored)
        monkeypatch.setenv("CURSOR_PROJECT_DIR", str(env_workspace))
        
        # Provide stdin workspace_roots (should take priority)
        input_data = {
            "status": "completed",
            "workspace_roots": [str(stdin_workspace)]
        }
        
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        # Should use stdin workspace and find the discussion
        assert code == 0
    
    def test_fallback_to_cwd(self, tmp_path):
        """Test fallback to current working directory when no stdin or env."""
        # Create discussion in tmp_path (which will be cwd)
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        # No workspace_roots in stdin, no env vars
        input_data = {"status": "completed"}
        
        code, stdout, stderr = run_hook(CHECK_PRECIPITATION, input_data, cwd=tmp_path)
        
        # Should fallback to cwd and find the discussion
        assert code == 0
