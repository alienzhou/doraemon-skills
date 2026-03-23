"""
Tests for hooks/common/logging_utils.py
"""

import pytest
import logging
from pathlib import Path
import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "hooks"))

from common.logging_utils import (
    get_base_dir,
    get_config_dir,
    get_data_dir,
    get_log_dir,
    ensure_directories,
    get_logger,
    log_hook_start,
    log_hook_end,
    log_file_operation,
    log_discuss_detection,
    log_meta_update,
    log_stale_detection,
    log_error,
    log_warning,
    log_info,
    log_debug,
)


class TestDirectoryPaths:
    """Tests for directory path functions."""
    
    def test_get_base_dir(self):
        """Test base directory path."""
        result = get_base_dir()
        assert result == Path.home() / ".discuss-for-specs"
    
    def test_get_config_dir(self):
        """Test config directory path (alias for base)."""
        result = get_config_dir()
        assert result == get_base_dir()
    
    def test_get_data_dir(self):
        """Test data directory path (alias for base)."""
        result = get_data_dir()
        assert result == get_base_dir()
    
    def test_get_log_dir(self):
        """Test log directory path."""
        result = get_log_dir()
        assert result == Path.home() / ".discuss-for-specs" / "logs"


class TestEnsureDirectories:
    """Tests for ensure_directories function."""
    
    def test_creates_directories(self, tmp_path, monkeypatch):
        """Test that directories are created."""
        # Mock Path.home() to return tmp_path
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        ensure_directories()
        
        base_dir = tmp_path / ".discuss-for-specs"
        log_dir = base_dir / "logs"
        
        assert base_dir.exists()
        assert log_dir.exists()


class TestGetLogger:
    """Tests for get_logger function."""
    
    def test_returns_logger(self, tmp_path, monkeypatch):
        """Test logger creation."""
        # Mock home directory
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        # Clear cached logger
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        logger = get_logger("test")
        
        assert logger is not None
        assert isinstance(logger, logging.Logger)
    
    def test_returns_same_logger(self, tmp_path, monkeypatch):
        """Test logger caching."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        logger1 = get_logger("test")
        logger2 = get_logger("test")
        
        assert logger1 is logger2


class TestLogFunctions:
    """Tests for log helper functions."""
    
    def test_log_hook_start(self, tmp_path, monkeypatch):
        """Test hook start logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        # Should not raise
        log_hook_start("test_hook", {"key": "value"})
    
    def test_log_hook_end(self, tmp_path, monkeypatch):
        """Test hook end logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_hook_end("test_hook", {"result": "ok"}, success=True)
        log_hook_end("test_hook", {}, success=False)
    
    def test_log_file_operation(self, tmp_path, monkeypatch):
        """Test file operation logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_file_operation("EDIT", "/path/to/file.md", "File edited")
    
    def test_log_discuss_detection(self, tmp_path, monkeypatch):
        """Test discussion detection logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_discuss_detection("/project/.discuss/topic", "outline")
    
    def test_log_meta_update(self, tmp_path, monkeypatch):
        """Test meta update logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_meta_update("/path/to/discuss", {"current_round": 5})
    
    def test_log_stale_detection(self, tmp_path, monkeypatch):
        """Test stale detection logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        stale_items = [("decisions", 5, False)]
        log_stale_detection("/path/to/discuss", stale_items)
    
    def test_log_error(self, tmp_path, monkeypatch):
        """Test error logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_error("Test error message")
        log_error("Test error with exception", Exception("test"))
    
    def test_log_warning(self, tmp_path, monkeypatch):
        """Test warning logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_warning("Test warning message")
    
    def test_log_info(self, tmp_path, monkeypatch):
        """Test info logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_info("Test info message")
    
    def test_log_debug(self, tmp_path, monkeypatch):
        """Test debug logging."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        log_debug("Test debug message")


class TestLogFileCreation:
    """Tests for log file creation."""
    
    def test_creates_log_file(self, tmp_path, monkeypatch):
        """Test that log file is created."""
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        
        import common.logging_utils as logging_module
        logging_module._logger = None
        
        # Log something to trigger file creation
        log_info("Test message")
        
        log_dir = tmp_path / ".discuss-for-specs" / "logs"
        
        # Check log directory exists
        assert log_dir.exists()
