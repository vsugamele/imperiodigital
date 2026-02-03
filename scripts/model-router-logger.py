#!/usr/bin/env python3
"""
Logger pra rastrear uso de modelos
Cria relatório diário de qual modelo foi usado pra qual tipo de task
"""
import json
import sys
from datetime import datetime
from pathlib import Path

LOG_DIR = Path("C:\\Users\\vsuga\\clawd\\memory")
LOG_FILE = LOG_DIR / f"model-routing-{datetime.now().strftime('%Y-%m-%d')}.log"

def log_routing(prompt, analysis, model_key):
    """Log uma decisão de roteamento"""
    
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt,
        "model": model_key,
        "category": analysis["category"],
        "complexity": analysis["complexity"],
        "prompt_length": analysis["prompt_length"]
    }
    
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    return LOG_FILE

def get_stats():
    """Calcula estatísticas de uso"""
    
    stats = {
        "total": 0,
        "by_model": {},
        "by_category": {},
        "avg_complexity": 0,
        "total_complexity": 0
    }
    
    if not LOG_FILE.exists():
        return stats
    
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                entry = json.loads(line)
                stats["total"] += 1
                
                model = entry.get("model", "unknown")
                stats["by_model"][model] = stats["by_model"].get(model, 0) + 1
                
                category = entry.get("category", "unknown")
                stats["by_category"][category] = stats["by_category"].get(category, 0) + 1
                
                complexity = entry.get("complexity", 0)
                stats["total_complexity"] += complexity
            except:
                pass
    
    if stats["total"] > 0:
        stats["avg_complexity"] = round(stats["total_complexity"] / stats["total"], 2)
    
    return stats

def print_stats():
    """Printa estatísticas formatadas"""
    
    stats = get_stats()
    
    print("\n" + "="*50)
    print("MODEL ROUTING STATISTICS")
    print("="*50)
    print(f"Total Requests: {stats['total']}")
    print(f"Avg Complexity: {stats['avg_complexity']}/10")
    print()
    
    if stats["by_model"]:
        print("By Model:")
        for model, count in sorted(stats["by_model"].items(), key=lambda x: x[1], reverse=True):
            percent = round(count / stats["total"] * 100, 1) if stats["total"] > 0 else 0
            print(f"  {model}: {count} ({percent}%)")
    print()
    
    if stats["by_category"]:
        print("By Category:")
        for cat, count in sorted(stats["by_category"].items(), key=lambda x: x[1], reverse=True):
            percent = round(count / stats["total"] * 100, 1) if stats["total"] > 0 else 0
            print(f"  {cat}: {count} ({percent}%)")
    
    print("="*50 + "\n")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stats":
        print_stats()
    else:
        print(f"Log location: {LOG_FILE}")
        print("Use: model-router-logger.py stats")
