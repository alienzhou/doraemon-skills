"""
Tests for hooks/common/platform_utils.py
"""

import json
import pytest
import sys
from io import StringIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "hooks"))

from common.platform_utils import (
    Platform,
    detect_platform,
    get_file_path_from_input,
    is_stop_hook_active,
    format_output_allow,
    format_output_block,
)


class TestDetectPlatform:
    """Tests for detect_platform function."""
    
    def test_detect_claude_code_by_tool_name(self):
        """Test detecting Claude Code by tool_name field."""
        input_data = {
            "tool_name": "Edit",
            "tool_input": {"file_path": "/test/file.md"}
        }
        
        result = detect_platform(input_data)
        
        assert result == Platform.CLAUDE_CODE
    
    def test_detect_claude_code_by_hook_event(self):
        """Test detecting Claude Code by hook_event_name field."""
        input_data = {
            "hook_event_name": "Stop",
            "stop_hook_active": False
        }
        
        result = detect_platform(input_data)
        
        assert result == Platform.CLAUDE_CODE
    
    def test_detect_cursor_by_file_path(self):
        """Test detecting Cursor by top-level file_path."""
        input_data = {
            "file_path": "/test/file.md",
            "edits": [{"old_string": "a", "new_string": "b"}]
        }
        
        result = detect_platform(input_data)
        
        assert result == Platform.CURSOR
    
    def test_detect_cursor_by_status(self):
        """Test detecting Cursor by completed status."""
        input_data = {
            "status": "completed",
            "loop_count": 0
        }
        
        result = detect_platform(input_data)
        
        assert result == Platform.CURSOR
    
    def test_detect_unknown(self):
        """Test unknown platform for unrecognized input."""
        input_data = {"some_field": "some_value"}
        
        result = detect_platform(input_data)
        
        assert result == Platform.UNKNOWN
    
    def test_detect_none_input(self):
        """Test None input returns unknown."""
        result = detect_platform(None)
        
        assert result == Platform.UNKNOWN


class TestGetFilePathFromInput:
    """Tests for get_file_path_from_input function."""
    
    def test_cursor_format(self):
        """Test extracting file_path from Cursor format."""
        input_data = {
            "file_path": "/path/to/file.md",
            "edits": []
        }
        
        result = get_file_path_from_input(input_data)
        
        assert result == "/path/to/file.md"
    
    def test_claude_code_format(self):
        """Test extracting file_path from Claude Code format."""
        input_data = {
            "tool_name": "Edit",
            "tool_input": {
                "file_path": "/path/to/file.md",
                "old_string": "a",
                "new_string": "b"
            }
        }
        
        result = get_file_path_from_input(input_data)
        
        assert result == "/path/to/file.md"
    
    def test_no_file_path(self):
        """Test returning None when no file_path found."""
        input_data = {"status": "completed"}
        
        result = get_file_path_from_input(input_data)
        
        assert result is None
    
    def test_none_input(self):
        """Test None input returns None."""
        result = get_file_path_from_input(None)
        
        assert result is None


class TestIsStopHookActive:
    """Tests for is_stop_hook_active function."""
    
    def test_stop_hook_active_true(self):
        """Test detecting stop_hook_active=True."""
        input_data = {
            "hook_event_name": "Stop",
            "stop_hook_active": True
        }
        
        result = is_stop_hook_active(input_data)
        
        assert result is True
    
    def test_stop_hook_active_false(self):
        """Test detecting stop_hook_active=False."""
        input_data = {
            "hook_event_name": "Stop",
            "stop_hook_active": False
        }
        
        result = is_stop_hook_active(input_data)
        
        assert result is False
    
    def test_no_stop_hook_field(self):
        """Test returning False when field is missing."""
        input_data = {"status": "completed"}
        
        result = is_stop_hook_active(input_data)
        
        assert result is False
    
    def test_none_input(self):
        """Test None input returns False."""
        result = is_stop_hook_active(None)
        
        assert result is False


class TestFormatOutput:
    """Tests for format_output functions."""
    
    def test_format_allow(self):
        """Test allow output format."""
        result = format_output_allow()
        
        assert result == "{}"
    
    def test_format_block_cursor(self):
        """Test Cursor block output format."""
        result = format_output_block("Test message", Platform.CURSOR)
        parsed = json.loads(result)
        
        assert "followup_message" in parsed
        assert parsed["followup_message"] == "Test message"
    
    def test_format_block_claude(self):
        """Test Claude Code block output format."""
        result = format_output_block("Test message", Platform.CLAUDE_CODE)
        parsed = json.loads(result)
        
        assert parsed["decision"] == "block"
        assert parsed["reason"] == "Test message"
    
    def test_format_block_unknown(self):
        """Test unknown platform block output format."""
        result = format_output_block("Test message", Platform.UNKNOWN)
        parsed = json.loads(result)
        
        assert parsed["message"] == "Test message"
