"""
Tests for hooks/install.py

NOTE: Since D01 decision, only stop hook is used (file-edit hook removed).
"""

import pytest
import json
import shutil
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "hooks"))

from install import (
    get_home_dir,
    detect_platform,
    get_claude_settings_path,
    get_cursor_hooks_path,
    get_hooks_install_dir,
    copy_hooks_to_install_dir,
    install_claude_hooks,
    install_cursor_hooks,
    uninstall_claude_hooks,
    uninstall_cursor_hooks,
)


class TestGetHomeDir:
    """Tests for get_home_dir function."""
    
    def test_returns_path(self):
        """Test that home dir is returned."""
        result = get_home_dir()
        assert isinstance(result, Path)
        assert result.exists()


class TestDetectPlatform:
    """Tests for detect_platform function."""
    
    def test_detect_claude(self, tmp_path, monkeypatch):
        """Test detecting Claude Code."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".claude").mkdir()
        
        result = detect_platform()
        assert result == "claude"
    
    def test_detect_cursor(self, tmp_path, monkeypatch):
        """Test detecting Cursor."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".cursor").mkdir()
        
        result = detect_platform()
        assert result == "cursor"
    
    def test_detect_none(self, tmp_path, monkeypatch):
        """Test no platform detected."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = detect_platform()
        assert result is None
    
    def test_prefers_claude_if_both(self, tmp_path, monkeypatch):
        """Test Claude is preferred if both exist."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".claude").mkdir()
        (tmp_path / ".cursor").mkdir()
        
        result = detect_platform()
        assert result == "claude"


class TestGetPaths:
    """Tests for path getter functions."""
    
    def test_claude_settings_path(self, tmp_path, monkeypatch):
        """Test Claude settings path."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = get_claude_settings_path()
        assert result == tmp_path / ".claude" / "settings.json"
    
    def test_cursor_hooks_path(self, tmp_path, monkeypatch):
        """Test Cursor hooks path."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = get_cursor_hooks_path()
        assert result == tmp_path / ".cursor" / "hooks.json"
    
    def test_hooks_install_dir_claude(self, tmp_path, monkeypatch):
        """Test hooks install dir for Claude."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = get_hooks_install_dir("claude")
        assert result == tmp_path / ".claude" / "hooks" / "discuss"
    
    def test_hooks_install_dir_cursor(self, tmp_path, monkeypatch):
        """Test hooks install dir for Cursor."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = get_hooks_install_dir("cursor")
        assert result == tmp_path / ".cursor" / "hooks" / "discuss"


class TestCopyHooksToInstallDir:
    """Tests for copy_hooks_to_install_dir function."""
    
    def test_creates_directories(self, tmp_path, monkeypatch):
        """Test that directories are created."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = copy_hooks_to_install_dir("claude")
        
        assert result.exists()
        assert (result / "common").exists()
        assert (result / "stop").exists()
    
    def test_copies_scripts(self, tmp_path, monkeypatch):
        """Test that hook scripts are copied."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = copy_hooks_to_install_dir("claude")
        
        assert (result / "stop" / "check_precipitation.py").exists()
    
    def test_copies_common_modules(self, tmp_path, monkeypatch):
        """Test that common modules are copied."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        
        result = copy_hooks_to_install_dir("claude")
        
        # At least some common modules should exist
        common_dir = result / "common"
        assert any(common_dir.glob("*.py"))


class TestInstallClaudeHooks:
    """Tests for install_claude_hooks function."""
    
    def test_creates_settings(self, tmp_path, monkeypatch, capsys):
        """Test creating new settings file."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".claude").mkdir()
        
        install_claude_hooks()
        
        settings_path = tmp_path / ".claude" / "settings.json"
        assert settings_path.exists()
        
        settings = json.loads(settings_path.read_text())
        assert "hooks" in settings
        assert "Stop" in settings["hooks"]
    
    def test_updates_existing_settings(self, tmp_path, monkeypatch, capsys):
        """Test updating existing settings file."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        claude_dir = tmp_path / ".claude"
        claude_dir.mkdir()
        
        # Create existing settings
        existing = {"existingKey": "preserved"}
        (claude_dir / "settings.json").write_text(json.dumps(existing))
        
        install_claude_hooks()
        
        settings = json.loads((claude_dir / "settings.json").read_text())
        assert settings["existingKey"] == "preserved"
        assert "hooks" in settings
    
    def test_idempotent(self, tmp_path, monkeypatch, capsys):
        """Test that multiple installs don't duplicate hooks."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".claude").mkdir()
        
        install_claude_hooks()
        install_claude_hooks()
        
        settings = json.loads((tmp_path / ".claude" / "settings.json").read_text())
        # Should only have one Stop hook
        assert len(settings["hooks"]["Stop"]) == 1


class TestInstallCursorHooks:
    """Tests for install_cursor_hooks function."""
    
    def test_creates_hooks_json(self, tmp_path, monkeypatch, capsys):
        """Test creating new hooks.json file."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".cursor").mkdir()
        
        install_cursor_hooks()
        
        hooks_path = tmp_path / ".cursor" / "hooks.json"
        assert hooks_path.exists()
        
        config = json.loads(hooks_path.read_text())
        assert "hooks" in config
        assert "stop" in config["hooks"]
    
    def test_idempotent(self, tmp_path, monkeypatch, capsys):
        """Test that multiple installs don't duplicate hooks."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".cursor").mkdir()
        
        install_cursor_hooks()
        install_cursor_hooks()
        
        config = json.loads((tmp_path / ".cursor" / "hooks.json").read_text())
        assert len(config["hooks"]["stop"]) == 1


class TestUninstallClaudeHooks:
    """Tests for uninstall_claude_hooks function."""
    
    def test_removes_hooks_from_settings(self, tmp_path, monkeypatch, capsys):
        """Test removing hooks from settings."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".claude").mkdir()
        
        # Install first
        install_claude_hooks()
        
        # Verify installed
        settings = json.loads((tmp_path / ".claude" / "settings.json").read_text())
        assert len(settings["hooks"]["Stop"]) > 0
        
        # Uninstall
        uninstall_claude_hooks()
        
        # Verify removed
        settings = json.loads((tmp_path / ".claude" / "settings.json").read_text())
        assert len(settings["hooks"]["Stop"]) == 0
    
    def test_removes_install_directory(self, tmp_path, monkeypatch, capsys):
        """Test removing installed hooks directory."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".claude").mkdir()
        
        install_claude_hooks()
        install_dir = tmp_path / ".claude" / "hooks" / "discuss"
        assert install_dir.exists()
        
        uninstall_claude_hooks()
        assert not install_dir.exists()


class TestUninstallCursorHooks:
    """Tests for uninstall_cursor_hooks function."""
    
    def test_removes_hooks_from_config(self, tmp_path, monkeypatch, capsys):
        """Test removing hooks from config."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".cursor").mkdir()
        
        install_cursor_hooks()
        uninstall_cursor_hooks()
        
        config = json.loads((tmp_path / ".cursor" / "hooks.json").read_text())
        assert len(config["hooks"]["stop"]) == 0
    
    def test_removes_install_directory(self, tmp_path, monkeypatch, capsys):
        """Test removing installed hooks directory."""
        monkeypatch.setattr("install.get_home_dir", lambda: tmp_path)
        (tmp_path / ".cursor").mkdir()
        
        install_cursor_hooks()
        install_dir = tmp_path / ".cursor" / "hooks" / "discuss"
        assert install_dir.exists()
        
        uninstall_cursor_hooks()
        assert not install_dir.exists()
