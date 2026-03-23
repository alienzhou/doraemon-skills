"""
Tests for hooks/common/meta_parser.py

NOTE: meta_parser.py has been simplified for backward compatibility only.
Most functionality has moved to snapshot_manager.py (see D02 decision).
"""

import pytest
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "hooks"))

from common.meta_parser import load_meta


class TestLoadMeta:
    """Tests for load_meta function (backward compatibility)."""
    
    def test_load_meta_nonexistent(self, tmp_path):
        """Test loading from non-existent directory."""
        result = load_meta(str(tmp_path / "nonexistent"))
        assert result is None
    
    def test_load_meta_no_file(self, tmp_path):
        """Test loading from directory without meta.yaml."""
        result = load_meta(str(tmp_path))
        assert result is None
    
    def test_load_meta_with_file(self, tmp_path):
        """Test loading from directory with meta.yaml."""
        import yaml
        
        meta = {"current_round": 5, "test_key": "test_value"}
        (tmp_path / "meta.yaml").write_text(yaml.dump(meta))
        
        loaded = load_meta(str(tmp_path))
        assert loaded == meta
    
    def test_load_meta_invalid_yaml(self, tmp_path):
        """Test loading invalid yaml returns None."""
        (tmp_path / "meta.yaml").write_text("invalid: [yaml: content")
        
        result = load_meta(str(tmp_path))
        assert result is None
