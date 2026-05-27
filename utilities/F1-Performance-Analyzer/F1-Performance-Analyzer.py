import urllib.request
import json

base_url = "https://api.jolpica.erik.mclarty.int/ergast/f1"

while True:
    print("\n=============================================")
    print("🏎️  F1 DRIVER & TEAM PERFORMANCE ANALYZER  🏎️")
    print("=============================================")
    print("1️⃣  View Current Top 10 Driver Standings")
    print("2️⃣  View Constructor Standings")
    print("3️⃣  Exit")
    
    choice = input("\n🎯 Enter your choice (1-3): ").strip()
    
    if choice == "3":
        print("\n👋 Thank you for using F1 Analyzer! Circuit out. 🏁\n")
        break
        
    if choice not in ("1", "2"):
        print("❌ Invalid choice. Please enter 1, 2, or 3.")
        continue
        
    if choice == "1":
        print("\n🏁 Fetching current F1 Driver Standings...")
        endpoint = "current/driverStandings"
        url = f"{base_url}/{endpoint}.json"
        
        # Fetch using urllib
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    standings = data['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings']
                    print(f"\n🏆 {'Pos':<4} | {'Driver':<20} | {'Constructor':<20} | {'Points':<6}")
                    print("-" * 60)
                    for item in standings[:10]:  # Top 10 Drivers
                        pos = item['position']
                        driver = f"{item['Driver']['givenName']} {item['Driver']['familyName']}"
                        team = item['Constructors'][0]['name']
                        points = item['points']
                        print(f"{pos:<4} | {driver:<20} | {team:<20} | {points:<6}")
                else:
                    print(f"❌ Error fetching data: Status code {response.status}")
        except Exception as e:
            print(f"❌ Connection or parsing error: {e}")
            
    elif choice == "2":
        print("\n🏎️  Fetching current F1 Constructor Standings...")
        endpoint = "current/constructorStandings"
        url = f"{base_url}/{endpoint}.json"
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    standings = data['MRData']['StandingsTable']['StandingsLists'][0]['ConstructorStandings']
                    print(f"\n🏆 {'Pos':<4} | {'Constructor':<25} | {'Nationality':<15} | {'Points':<6}")
                    print("-" * 60)
                    for item in standings:
                        pos = item['position']
                        team = item['Constructor']['name']
                        nat = item['Constructor']['nationality']
                        points = item['points']
                        print(f"{pos:<4} | {team:<25} | {nat:<15} | {points:<6}")
                else:
                    print(f"❌ Error fetching data: Status code {response.status}")
        except Exception as e:
            print(f"❌ Connection or parsing error: {e}")