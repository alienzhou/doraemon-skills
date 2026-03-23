"""
Tests for hooks/common/file_utils.py
"""

import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "hooks"))

from common.file_utils import (
    ensure_directory,
    find_discuss_root,
    get_decision_path,
)


class TestEnsureDirectory:
    """Tests for ensure_directory function."""
    
    def test_creates_directory(self, tmp_path):
        """Test creating a new directory."""
        new_dir = tmp_path / "new" / "nested" / "dir"
        
        result = ensure_directory(str(new_dir))
        
        assert new_dir.exists()
        assert result == new_dir
    
    def test_existing_directory(self, tmp_path):
        """Test with existing directory."""
        existing_dir = tmp_path / "existing"
        existing_dir.mkdir()
        
        result = ensure_directory(str(existing_dir))
        
        assert result == existing_dir


class TestFindDiscussRoot:
    """Tests for find_discuss_root function."""
    
    def test_finds_root_from_file(self, tmp_path):
        """Test finding root from a file in discussion."""
        # Create discussion structure
        discuss_dir = tmp_path / "discuss" / "2026-01-20" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "meta.yaml").write_text("current_run: 1")
        
        # Create subdirectory with file
        decisions_dir = discuss_dir / "decisions"
        decisions_dir.mkdir()
        test_file = decisions_dir / "test.md"
        test_file.write_text("# Test")
        
        result = find_discuss_root(str(test_file))
        
        assert result == discuss_dir
    
    def test_finds_root_from_outline(self, tmp_path):
        """Test finding root from outline.md."""
        discuss_dir = tmp_path / "discuss" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "meta.yaml").write_text("current_run: 1")
        outline = discuss_dir / "outline.md"
        outline.write_text("# Outline")
        
        result = find_discuss_root(str(outline))
        
        assert result == discuss_dir
    
    def test_not_found(self, tmp_path):
        """Test returning None when not in discussion."""
        random_file = tmp_path / "random" / "file.md"
        random_file.parent.mkdir(parents=True)
        random_file.write_text("# Random")
        
        result = find_discuss_root(str(random_file))
        
        assert result is None
    
    def test_finds_from_meta_dir(self, tmp_path):
        """Test finding root from directory containing meta.yaml."""
        discuss_dir = tmp_path / "discuss"
        discuss_dir.mkdir()
        (discuss_dir / "meta.yaml").write_text("current_run: 1")
        
        result = find_discuss_root(str(discuss_dir))
        
        assert result == discuss_dir

    def test_finds_root_from_outline_without_meta(self, tmp_path):
        """Test finding root from outline.md when meta.yaml doesn't exist yet.
        
        This tests the chicken-and-egg fix: the hook should be able to find
        the discuss root even before meta.yaml is created.
        """
        # Create discussion structure WITHOUT meta.yaml
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "test-topic"
        discuss_dir.mkdir(parents=True)
        outline = discuss_dir / "outline.md"
        outline.write_text("# Test Topic")
        
        result = find_discuss_root(str(outline))
        
        assert result == discuss_dir
    
    def test_finds_root_from_pattern_without_files(self, tmp_path):
        """Test finding root from directory pattern when no files exist yet.
        
        This tests the case where neither meta.yaml nor outline.md exists,
        but the directory structure matches .discuss/YYYY-MM-DD/topic/.
        """
        # Create directory matching the pattern but with no files
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "new-topic"
        discuss_dir.mkdir(parents=True)
        
        result = find_discuss_root(str(discuss_dir))
        
        assert result == discuss_dir
    
    def test_finds_root_from_subdirectory_pattern(self, tmp_path):
        """Test finding root from a subdirectory within discuss directory."""
        # Create discuss directory with decisions subdirectory
        discuss_dir = tmp_path / ".discuss" / "2026-01-28" / "my-topic"
        decisions_dir = discuss_dir / "decisions"
        decisions_dir.mkdir(parents=True)
        
        # Search from decisions subdirectory
        result = find_discuss_root(str(decisions_dir))
        
        # Should find the parent topic directory
        assert result == discuss_dir
    
    def test_pattern_requires_valid_date_format(self, tmp_path):
        """Test that pattern matching requires valid date format."""
        # Create directory with invalid date format
        invalid_dir = tmp_path / ".discuss" / "not-a-date" / "topic"
        invalid_dir.mkdir(parents=True)
        
        result = find_discuss_root(str(invalid_dir))
        
        # Should not match (no valid date)
        assert result is None
    
    def test_pattern_matching_with_outline_takes_priority(self, tmp_path):
        """Test that outline.md detection works even with non-standard path."""
        # Create a directory that doesn't match the pattern
        discuss_dir = tmp_path / "custom-discuss" / "topic"
        discuss_dir.mkdir(parents=True)
        (discuss_dir / "outline.md").write_text("# Topic")
        
        result = find_discuss_root(str(discuss_dir))
        
        # Should find via outline.md rule
        assert result == discuss_dir


class TestGetDecisionPath:
    """Tests for get_decision_path function."""
    
    def test_basic_path(self, tmp_path):
        """Test basic decision path generation."""
        result = get_decision_path(tmp_path, "D1", "Test Decision")
        
        expected = tmp_path / "decisions" / "01-test-decision.md"
        assert result == expected
    
    def test_double_digit_id(self, tmp_path):
        """Test with double-digit decision ID."""
        result = get_decision_path(tmp_path, "D12", "Another Decision")
        
        expected = tmp_path / "decisions" / "12-another-decision.md"
        assert result == expected
    
    def test_complex_title(self, tmp_path):
        """Test with complex title."""
        result = get_decision_path(tmp_path, "D3", "Use Meta YAML Schema")
        
        expected = tmp_path / "decisions" / "03-use-meta-yaml-schema.md"
        assert result == expected
