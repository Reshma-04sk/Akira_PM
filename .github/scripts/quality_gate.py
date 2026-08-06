import os
import sys
import re

def main():
    failed = False
    
    # 1. Check for duplicate lock files
    root_files = os.listdir('.')
    for file in ['package-lock.json', 'yarn.lock']:
        if file in root_files:
            print(f"ERROR: Duplicate lock file '{file}' found in root directory. We use pnpm-lock.yaml.")
            failed = True
            
    if os.path.exists('apps/backend'):
        backend_files = os.listdir('apps/backend')
        for file in ['poetry.lock', 'Pipfile.lock', 'requirements.txt']:
            if file in backend_files:
                print(f"ERROR: Duplicate lock file '{file}' found in apps/backend. We use uv.lock.")
                failed = True

    # 2. Scan source directories for console.log, debugger, conflict markers, TODO/FIXME comments
    paths_to_scan = {
        'apps/backend/src': ['.py'],
        'apps/frontend/src': ['.ts', '.tsx', '.js', '.jsx']
    }
    
    conflict_marker_pattern = re.compile(r'^(<<<<<<<|=======|>>>>>>>)', re.MULTILINE)
    todo_comment_pattern = re.compile(r'(#|//|/\*)\s*(TODO|FIXME)', re.IGNORECASE)
    console_log_pattern = re.compile(r'console\.log\s*\(')
    debugger_pattern = re.compile(r'\bdebugger\b')

    for scan_path, extensions in paths_to_scan.items():
        if not os.path.exists(scan_path):
            continue
        for root, dirs, files in os.walk(scan_path):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '__pycache__']]
            for file in files:
                is_test_file = (
                    file.endswith('.test.ts') or 
                    file.endswith('.test.tsx') or 
                    file.endswith('.spec.ts') or 
                    file == 'setup.ts'
                )
                
                _, ext = os.path.splitext(file)
                if ext not in extensions:
                    continue
                
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Check conflict markers
                    if conflict_marker_pattern.search(content):
                        print(f"ERROR: Merge conflict marker found in: {file_path}")
                        failed = True
                        
                    # Check debugger
                    if debugger_pattern.search(content):
                        print(f"ERROR: debugger statement found in: {file_path}")
                        failed = True
                        
                    # Check TODO/FIXME in comments
                    if todo_comment_pattern.search(content):
                        lines = content.splitlines()
                        for i, line in enumerate(lines):
                            if todo_comment_pattern.search(line):
                                print(f"ERROR: TODO/FIXME comment found in: {file_path}:{i+1} - {line.strip()}")
                        failed = True
                        
                    # Check console.log (only in frontend code, excluding test files)
                    if not is_test_file and 'frontend' in scan_path:
                        if console_log_pattern.search(content):
                            lines = content.splitlines()
                            for i, line in enumerate(lines):
                                if console_log_pattern.search(line):
                                    print(f"ERROR: console.log found in production file: {file_path}:{i+1} - {line.strip()}")
                            failed = True
                            
                except Exception as e:
                    print(f"WARNING: Could not read/parse {file_path}: {e}")

    # 3. Check for unused / checked-in temporary/generated files
    forbidden_generated_exts = ['.pyc', '.log', '.tmp', '.bak']
    for root, dirs, files in os.walk('.'):
        # Prune ignored directories in-place
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.venv', '.next', 'dist', 'build', '__pycache__']]
        for file in files:
            _, ext = os.path.splitext(file)
            if ext in forbidden_generated_exts:
                # Allow test_result.txt if it is a specific log artifact or test report
                if file == 'test_result.txt':
                    continue
                print(f"ERROR: Checked-in generated file found: {os.path.join(root, file)}")
                failed = True

    if failed:
        print("\nQuality Gate FAILED!")
        sys.exit(1)
    else:
        print("\nQuality Gate PASSED successfully!")
        sys.exit(0)

if __name__ == '__main__':
    main()
