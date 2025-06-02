# backend/app/services/visualization_service.py
import math
from typing import List, Dict, Any, Optional

class VisualizationService:
    """体験ストリングスの3D座標計算をサーバーサイドで実行"""
    
    def __init__(self):
        # カテゴリー別の色定義
        self.category_colors = {
            "ライフスタイル": "#6EE7B7",    # 淡い緑
            "アート・創作": "#C4B5FD",     # 淡い紫
            "料理・グルメ": "#FDE68A",     # 淡い黄色
            "ソーシャル": "#F9A8D4",       # 淡いピンク
            "学習・読書": "#93C5FD",       # 淡い青
            "自然・アウトドア": "#86EFAC",  # 淡いグリーン
            "スポーツ・運動": "#FCA5A5",   # 淡い赤
            "エンタメ": "#FDBA74",         # 淡いオレンジ
            "アート": "#C4B5FD",           # アート・創作のエイリアス
            "アウトドア": "#86EFAC",       # 自然・アウトドアのエイリアス
            "学び": "#93C5FD",             # 学習・読書のエイリアス
        }
    
    def seeded_random(self, seed: float) -> float:
        """シード値を使った固定ランダム関数"""
        x = math.sin(seed) * 10000
        return x - math.floor(x)
    
    def id_to_color(self, experience_id: int) -> str:
        """ID から HSL カラーを生成"""
        # 体験IDから簡単なハッシュ値を生成
        hash_value = abs(hash(str(experience_id)))
        
        # 美しい色相範囲を定義
        color_ranges = [
            {"min": 300, "max": 330},  # 紫-ピンク
            {"min": 200, "max": 240},  # 青-青紫
            {"min": 120, "max": 160},  # 緑-青緑
            {"min": 30, "max": 60},    # 黄-オレンジ
            {"min": 270, "max": 300},  # 紫
        ]
        
        # ハッシュ値から色相範囲を選択
        range_index = hash_value % len(color_ranges)
        selected_range = color_ranges[range_index]
        
        # 選択された範囲内で色相を決定
        hue = (hash_value * 137.508) % (selected_range["max"] - selected_range["min"]) + selected_range["min"]
        
        # より柔らかい彩度と明度に調整
        saturation = 40 + (hash_value % 20)  # 40-60%
        lightness = 70 + (hash_value % 15)   # 70-85%
        
        return f"hsl({int(hue)}, {saturation}%, {lightness}%)"
    
    def get_theme_color(self, experience_id: int, category: Optional[str] = None) -> str:
        """テーマカラーを取得"""
        if category and category in self.category_colors:
            return self.category_colors[category]
        return self.id_to_color(experience_id)
    
    def compute_spiral_positions(self, experiences: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """完了済み体験のらせん配置を計算"""
        completed_experiences = [exp for exp in experiences if exp.get('completed', False)]
        positions = []
        
        spiral_turns = 2  # らせんの巻数
        depth_range = 6   # 奥行きの範囲
        base_radius = 2   # 基本半径
        
        for index, exp in enumerate(completed_experiences):
            # らせんの角度計算
            t = index / max(len(completed_experiences) - 1, 1)
            angle = t * spiral_turns * math.pi * 2
            
            # Z座標（奥から手前へ）
            depth = -depth_range/2 + t * depth_range  # -3 から +3 へ
            
            # 半径の変化（手前に来るほど少し広がる）
            radius_variation = base_radius + t * 0.8
            
            # 固定ランダムな角度のずれ（±30度）
            seed = exp.get('id', index)
            angle_offset = (self.seeded_random(seed * 1.234) - 0.5) * math.pi / 3
            final_angle = angle + angle_offset
            
            # 位置の計算
            x = math.cos(final_angle) * radius_variation
            y = math.sin(final_angle) * radius_variation
            z = depth
            
            # 固定ランダムな距離のずれ
            distance_variation = 0.8 + self.seeded_random(seed * 2.345) * 0.4
            x *= distance_variation
            y *= distance_variation
            
            # 高さのバリエーション
            height_offset = (self.seeded_random(seed * 3.456) - 0.5) * 1.5
            y += height_offset
            
            # 難易度に応じてサイズを調整
            scale_multiplier = 0.8 + (exp.get('level', 1)) * 0.2
            
            # 色を計算
            color = self.get_theme_color(exp.get('id', index), exp.get('category'))
            
            positions.append({
                'experience_id': exp.get('id'),
                'position': {'x': x, 'y': y, 'z': z},
                'scale': scale_multiplier,
                'color': color,
                'seed': seed,
                'spiral_index': index,
                'depth': depth
            })
        
        return positions
    
    def compute_floating_positions(self, experiences: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """進行中ミッションの浮遊配置を計算"""
        incomplete_missions = [exp for exp in experiences if not exp.get('completed', False)]
        positions = []
        
        float_radius = 4.0
        
        for index, mission in enumerate(incomplete_missions):
            base_angle = (index / max(len(incomplete_missions), 1)) * math.pi * 2
            
            # 固定位置の計算
            seed = mission.get('id', index)
            height_offset = self.seeded_random(seed * 3.456) * 2 - 1  # -1 to 1
            radius_offset = self.seeded_random(seed * 4.567) * 0.5    # 0 to 0.5
            
            x = math.cos(base_angle) * (float_radius + radius_offset)
            y = math.sin(base_angle) * (float_radius + radius_offset)
            z = math.sin(base_angle * 2) * 1.5 + height_offset
            
            # 色を計算
            color = self.get_theme_color(mission.get('id', index), mission.get('category'))
            
            positions.append({
                'experience_id': mission.get('id'),
                'position': {'x': x, 'y': y, 'z': z},
                'color': color,
                'seed': seed,
                'index': index,
                'type': 'floating'
            })
        
        return positions
    
    def compute_connection_curves(self, spiral_positions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """球体間の接続曲線を計算"""
        if len(spiral_positions) < 2:
            return []
        
        curves = []
        
        for i in range(len(spiral_positions) - 1):
            start_pos = spiral_positions[i]['position']
            end_pos = spiral_positions[i + 1]['position']
            
            # 中点を計算
            mid_x = (start_pos['x'] + end_pos['x']) / 2
            mid_y = (start_pos['y'] + end_pos['y']) / 2
            mid_z = (start_pos['z'] + end_pos['z']) / 2
            
            # 距離を計算
            distance = math.sqrt(
                (end_pos['x'] - start_pos['x'])**2 +
                (end_pos['y'] - start_pos['y'])**2 +
                (end_pos['z'] - start_pos['z'])**2
            )
            
            # シード値を使って一貫した変位を生成
            start_id = spiral_positions[i]['experience_id']
            end_id = spiral_positions[i + 1]['experience_id']
            seed = (start_id or 0) + (end_id or 0)
            pseudo_random = (seed % 1000) / 1000
            
            bulge = distance * 0.3
            mid_x += (pseudo_random - 0.5) * bulge
            mid_y += (pseudo_random * 0.7 - 0.35) * bulge
            mid_z += (pseudo_random * 0.3 - 0.15) * bulge
            
            # カーブの制御点
            curve_points = [
                start_pos,
                {'x': mid_x, 'y': mid_y, 'z': mid_z},
                end_pos
            ]
            
            # 色のグラデーション
            start_color = spiral_positions[i]['color']
            end_color = spiral_positions[i + 1]['color']
            
            curves.append({
                'start_id': start_id,
                'end_id': end_id,
                'points': curve_points,
                'start_color': start_color,
                'end_color': end_color,
                'distance': distance
            })
        
        return curves
    
    def generate_visualization_data(self, experiences: List[Dict[str, Any]]) -> Dict[str, Any]:
        """全体的なビジュアライゼーションデータを生成"""
        # 完了済み体験の球体位置
        spiral_positions = self.compute_spiral_positions(experiences)
        
        # 進行中ミッションの浮遊位置
        floating_positions = self.compute_floating_positions(experiences)
        
        # 接続曲線
        connection_curves = self.compute_connection_curves(spiral_positions)
        
        # 統計情報
        total_experiences = len(experiences)
        completed_count = len([exp for exp in experiences if exp.get('completed', False)])
        incomplete_count = total_experiences - completed_count
        
        # カテゴリー分布
        categories = {}
        for exp in experiences:
            category = exp.get('category', 'その他')
            categories[category] = categories.get(category, 0) + 1
        
        return {
            'spiral_positions': spiral_positions,
            'floating_positions': floating_positions,
            'connection_curves': connection_curves,
            'stats': {
                'total_experiences': total_experiences,
                'completed_count': completed_count,
                'incomplete_count': incomplete_count,
                'categories': categories
            },
            'generated_at': f"{__import__('datetime').datetime.now().isoformat()}"
        }

# サービスインスタンス
visualization_service = VisualizationService()
