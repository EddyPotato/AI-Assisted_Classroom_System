# File: scripts/make_windows_compatible.py
# Version: v1.2
# Changes: Reverse logic updated to handle all CONCAT patterns and complex SQL conversions

import os
import re
import glob
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def mutate_csharp_backend_to_oracle():
    print("[SYSTEM] Mutating C# Backend back to Oracle compatibility...")
    
    # 1. Restore .csproj
    csproj_path = os.path.join(BASE_DIR, "campus-backend", "campus-backend.csproj")
    if os.path.exists(csproj_path):
        with open(csproj_path, 'r', encoding='utf-8') as f: csproj = f.read()
        csproj = re.sub(r'<PackageReference Include="MySqlConnector".*?/>', '<PackageReference Include="Oracle.ManagedDataAccess.Core" Version="23.26.200" />', csproj, flags=re.DOTALL)
        with open(csproj_path, 'w', encoding='utf-8') as f: f.write(csproj)

    # 2. Restore appsettings.json
    appsettings_path = os.path.join(BASE_DIR, "campus-backend", "appsettings.json")
    if os.path.exists(appsettings_path):
        with open(appsettings_path, 'r', encoding='utf-8') as f: settings = json.load(f)
        if "DefaultConnection" in settings.get("ConnectionStrings", {}):
            del settings["ConnectionStrings"]["DefaultConnection"]
        settings.setdefault("ConnectionStrings", {})["OracleConnection"] = "Data Source=localhost:1521/XEPDB1;User Id=campus_admin;Password=admin123;"
        with open(appsettings_path, 'w', encoding='utf-8') as f: json.dump(settings, f, indent=2)

    # 3. Restore Repositories
    repo_files = glob.glob(os.path.join(BASE_DIR, "campus-backend", "Repositories", "*.cs"))
    for file_path in repo_files:
        with open(file_path, 'r', encoding='utf-8') as f: code = f.read()
        
        # Import statement conversion (MySQL -> Oracle)
        code = code.replace("using MySqlConnector;", "using Oracle.ManagedDataAccess.Client;")
        code = code.replace("MySqlConnection", "OracleConnection")
        code = code.replace("MySqlCommand", "OracleCommand")
        code = code.replace("MySqlDataReader", "OracleDataReader")
        
        # REVERSE: Uncomment BindByName
        code = re.sub(r'//\s*([a-zA-Z0-9_]+\.BindByName\s*=\s*true;).*', r'\1', code)
        
        # REVERSE: Revert Professor name concatenation (CONCAT back to ||)
        code = code.replace(
            "CONCAT(u.First_Name, CASE WHEN u.MIDDLE_NAME IS NOT NULL THEN CONCAT(' ', u.MIDDLE_NAME) ELSE '' END, ' ', u.Last_Name) AS Professor_Name",
            "u.First_Name || CASE WHEN u.MIDDLE_NAME IS NOT NULL THEN ' ' || u.MIDDLE_NAME ELSE '' END || ' ' || u.Last_Name AS Professor_Name"
        )
        
        # REVERSE: Simple LIKE pattern - CONCAT('%', @param, '%') back to 'string' || :param || 'string'
        code = re.sub(r"CONCAT\('%',\s*@([a-zA-Z0-9_]+),\s*'%'\)", r"'%' || :\1 || '%'", code)
        
        # REVERSE: Generic CONCAT back to || (handles other CONCAT patterns)
        lines = code.split('\n')
        for i, line in enumerate(lines):
            if 'CONCAT(' in line and '@"' in line:
                # Find CONCAT(...) patterns in SQL strings and convert back to ||
                match = re.search(r'@"(.*?)"', line, re.DOTALL)
                if match and 'CONCAT(' in match.group(1):
                    sql_part = match.group(1)
                    
                    # Find CONCAT calls and replace with ||
                    def revert_concat(m):
                        args = m.group(1)
                        # Split arguments and preserve nested structures
                        parts = [p.strip() for p in args.split(', ')]
                        return ' || '.join(parts)
                    
                    sql_part_reverted = re.sub(r'CONCAT\(([^)]+)\)', revert_concat, sql_part)
                    line = line.replace(f'@"{sql_part}"', f'@"{sql_part_reverted}"')
            
            lines[i] = line
        
        code = '\n'.join(lines)
        
        # REVERSE: Convert @param back to :param
        code = re.sub(r'@([a-zA-Z0-9_]+)', r':\1', code)
        
        with open(file_path, 'w', encoding='utf-8') as f: f.write(code)

if __name__ == "__main__":
    mutate_csharp_backend_to_oracle()
    print("[SUCCESS] System is now natively configured for Windows/Oracle.")