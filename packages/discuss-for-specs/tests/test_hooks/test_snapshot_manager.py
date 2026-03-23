"""
Tests for hooks/common/snapshot_manager.py
"""

import pytest
from pathlib import Path
import time

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "hooks"))

from common.snapshot_manager import (
    load_snapshot,
    save_snapshot,
    create_default_snapshot,
    get_discuss_key,
    find_active_discussions,
    scan_discussion,
    compare_and_update,
    cleanup_deleted_discussions,
)


class TestCreateDefaultSnapshot:
    """Tests for create_default_snapshot function."""
    
    def test_has_required_fields(self):
        """Test default snapshot has all required fields."""
        snapshot = create_default_snapshot()
        
        assert "version" in snapshot
        assert "config" in snapshot
        assert "discussions" in snapshot
    
    def test_version_is_1(self):
        """Test version is 1."""
        snapshot = create_default_snapshot()
        assert snapshot["version"] == 1
    
    def test_config_has_stale_threshold(self):
        """Test config has default stale_threshold."""
        snapshot = create_default_snapshot()
        assert snapshot["config"]["stale_threshold"] == 3
    
    def test_discussions_empty(self):
        """Test discussions starts empty."""
        snapshot = create_default_snapshot()
        assert snapshot["discussions"] == {}


class TestLoadSaveSnapshot:
    """Tests for load_snapshot and save_snapshot functions."""
    
    def test_load_nonexistent_returns_default(self, tmp_path):
        """Test loading from non-existent directory returns default."""
        discuss_root = tmp_path / ".discuss"
        discuss_root.mkdir()
        
        result = load_snapshot(discuss_root)
        
        assert result["version"] == 1
        assert result["discussions"] == {}
    
    def test_save_and_load_snapshot(self, tmp_path):
        """Test saving and loading snapshot."""
        discuss_root = tmp_path / ".discuss"
        discuss_root.mkdir()
        
        snapshot = {
            "version": 1,
            "config": {"stale_threshold": 5},
            "discussions": {
                "2026-01-30/topic": {
                    "outline": {"mtime": 123.0, "change_count": 2}
                }
            }
        }
        
        save_snapshot(discuss_root, snapshot)
        loaded = load_snapshot(discuss_root)
        
        assert loaded["config"]["stale_threshold"] == 5
        assert "2026-01-30/topic" in loaded["discussions"]
    
    def test_snapshot_file_location(self, tmp_path):
        """Test snapshot is saved to .snapshot.yaml."""
        discuss_root = tmp_path / ".discuss"
        discuss_root.mkdir()
        
        save_snapshot(discuss_root, create_default_snapshot())
        
        assert (discuss_root / ".snapshot.yaml").exists()


class TestGetDiscussKey:
    """Tests for get_discuss_key function."""
    
    def test_returns_relative_path(self, tmp_path):
        """Test returns relative path as key."""
        discuss_root = tmp_path / ".discuss"
        discuss_dir = discuss_root / "2026-01-30" / "topic-name"
        discuss_dir.mkdir(parents=True)
        
        key = get_discuss_key(discuss_dir, discuss_root)
        
        assert key == "2026-01-30/topic-name"


class TestFindActiveDiscussions:
    """Tests for find_active_discussions function."""
    
    def test_empty_directory(self, tmp_path):
        """Test with empty .discuss directory."""
        discuss_root = tmp_path / ".discuss"
        discuss_root.mkdir()
        
        result = find_active_discussions(discuss_root)
        
        assert result == []
    
    def test_finds_recently_modified(self, tmp_path):
        """Test finds recently modified discussions."""
        discuss_root = tmp_path / ".discuss"
        discuss_dir = discuss_root / "2026-01-30" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Outline")
        
        result = find_active_discussions(discuss_root)
        
        assert len(result) == 1
        assert result[0] == discuss_dir


class TestScanDiscussion:
    """Tests for scan_discussion function."""
    
    def test_empty_directory(self, tmp_path):
        """Test scanning empty discussion directory."""
        discuss_dir = tmp_path / "topic"
        discuss_dir.mkdir()
        
        result = scan_discussion(discuss_dir)
        
        assert result["outline"]["mtime"] == 0.0
        assert result["outline"]["change_count"] == 0
        assert result["decisions"] == []
        assert result["notes"] == []
    
    def test_scans_outline(self, tmp_path):
        """Test scanning outline.md."""
        discuss_dir = tmp_path / "topic"
        discuss_dir.mkdir()
        outline = discuss_dir / "outline.md"
        outline.write_text("# Outline")
        
        result = scan_discussion(discuss_dir)
        
        assert result["outline"]["mtime"] > 0
    
    def test_scans_decisions(self, tmp_path):
        """Test scanning decisions directory."""
        discuss_dir = tmp_path / "topic"
        decisions_dir = discuss_dir / "decisions"
        decisions_dir.mkdir(parents=True)
        (decisions_dir / "D01-test.md").write_text("# Decision")
        
        result = scan_discussion(discuss_dir)
        
        assert len(result["decisions"]) == 1
        assert result["decisions"][0]["name"] == "D01-test.md"
    
    def test_scans_notes(self, tmp_path):
        """Test scanning notes directory."""
        discuss_dir = tmp_path / "topic"
        notes_dir = discuss_dir / "notes"
        notes_dir.mkdir(parents=True)
        (notes_dir / "research.md").write_text("# Research")
        
        result = scan_discussion(discuss_dir)
        
        assert len(result["notes"]) == 1
        assert result["notes"][0]["name"] == "research.md"


class TestCompareAndUpdate:
    """Tests for compare_and_update function."""
    
    def test_new_discussion(self):
        """Test new discussion - first outline modification increments change_count."""
        old_state = {}
        new_state = {
            "outline": {"mtime": 100.0, "change_count": 0},
            "decisions": [],
            "notes": []
        }
        
        result = compare_and_update(old_state, new_state)
        
        # First outline modification starts the count
        assert result == 1
        assert new_state["outline"]["change_count"] == 1
    
    def test_outline_changed_increments_count(self):
        """Test outline mtime change increments change_count."""
        old_state = {
            "outline": {"mtime": 100.0, "change_count": 1},
            "decisions": [],
            "notes": []
        }
        new_state = {
            "outline": {"mtime": 200.0, "change_count": 0},
            "decisions": [],
            "notes": []
        }
        
        result = compare_and_update(old_state, new_state)
        
        assert result == 2
        assert new_state["outline"]["change_count"] == 2
    
    def test_decisions_changed_resets_count(self):
        """Test decisions change resets change_count."""
        old_state = {
            "outline": {"mtime": 100.0, "change_count": 5},
            "decisions": [],
            "notes": []
        }
        new_state = {
            "outline": {"mtime": 200.0, "change_count": 0},
            "decisions": [{"name": "D01.md", "mtime": 200.0}],
            "notes": []
        }
        
        result = compare_and_update(old_state, new_state)
        
        assert result == 0
        assert new_state["outline"]["change_count"] == 0
    
    def test_notes_changed_resets_count(self):
        """Test notes change resets change_count."""
        old_state = {
            "outline": {"mtime": 100.0, "change_count": 3},
            "decisions": [],
            "notes": []
        }
        new_state = {
            "outline": {"mtime": 200.0, "change_count": 0},
            "decisions": [],
            "notes": [{"name": "note.md", "mtime": 200.0}]
        }
        
        result = compare_and_update(old_state, new_state)
        
        assert result == 0
        assert new_state["outline"]["change_count"] == 0
    
    def test_no_change_preserves_count(self):
        """Test no change preserves change_count."""
        old_state = {
            "outline": {"mtime": 100.0, "change_count": 2},
            "decisions": [],
            "notes": []
        }
        new_state = {
            "outline": {"mtime": 100.0, "change_count": 0},
            "decisions": [],
            "notes": []
        }
        
        result = compare_and_update(old_state, new_state)
        
        assert result == 2
        assert new_state["outline"]["change_count"] == 2


class TestCleanupDeletedDiscussions:
    """Tests for cleanup_deleted_discussions function."""
    
    def test_removes_deleted_discussion(self, tmp_path):
        """Test removes entry for deleted discussion."""
        discuss_root = tmp_path / ".discuss"
        discuss_root.mkdir()
        
        snapshot = {
            "version": 1,
            "config": {},
            "discussions": {
                "2026-01-30/deleted-topic": {
                    "outline": {"mtime": 100.0, "change_count": 1}
                }
            }
        }
        
        cleaned = cleanup_deleted_discussions(snapshot, discuss_root)
        
        assert cleaned == 1
        assert "2026-01-30/deleted-topic" not in snapshot["discussions"]
    
    def test_preserves_existing_discussion(self, tmp_path):
        """Test preserves entry for existing discussion."""
        discuss_root = tmp_path / ".discuss"
        discuss_dir = discuss_root / "2026-01-30" / "existing-topic"
        discuss_dir.mkdir(parents=True)
        
        snapshot = {
            "version": 1,
            "config": {},
            "discussions": {
                "2026-01-30/existing-topic": {
                    "outline": {"mtime": 100.0, "change_count": 1}
                }
            }
        }
        
        cleaned = cleanup_deleted_discussions(snapshot, discuss_root)
        
        assert cleaned == 0
        assert "2026-01-30/existing-topic" in snapshot["discussions"]
