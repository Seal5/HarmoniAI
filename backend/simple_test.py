#!/usr/bin/env python3
"""
Simple test script for the HarmoniAI routing agent
Tests the routing logic without requiring LangChain
"""


def calculate_scores(data):
    """Calculate clinical scores from survey data."""
    phq9_score = sum([data[f"phq9_{i}"] for i in range(1, 10)])
    gad7_score = sum([data[f"gad7_{i}"] for i in range(1, 8)])
    pcl5_score = sum([data[f"pcl5_{i}"] for i in range(1, 9)])
    crisis_indicator = data["phq9_9"]

    return {
        "phq9": phq9_score,
        "gad7": gad7_score,
        "pcl5": pcl5_score,
        "crisis_indicator": crisis_indicator,
    }


def route_user(data):
    """Simple routing logic based on clinical scores."""
    scores = calculate_scores(data)

    # Initialize default values
    primary_category = "LIFESTYLE"
    confidence = 0.7
    reasoning = ""

    # Crisis assessment (highest priority)
    if scores["crisis_indicator"] >= 1:
        primary_category = "CRISIS"
        confidence = 0.95
        reasoning = "Immediate intervention required due to suicidal ideation"

    # Trauma assessment
    elif scores["pcl5"] >= 20:
        primary_category = "TRAUMA"
        confidence = 0.85
        reasoning = f"High trauma symptoms (PCL-5: {scores['pcl5']}) - specialized trauma care recommended"

    # Depression assessment
    elif scores["phq9"] >= 15:
        primary_category = "DEPRESSION"
        confidence = 0.88
        reasoning = f"Severe depression symptoms (PHQ-9: {scores['phq9']}) - therapy and psychiatric evaluation"

    # Anxiety assessment
    elif scores["gad7"] >= 10:
        primary_category = "ANXIETY"
        confidence = 0.82
        reasoning = f"Moderate-severe anxiety (GAD-7: {scores['gad7']}) - CBT and anxiety management"

    # Mild to moderate symptoms
    elif scores["phq9"] >= 10 or scores["gad7"] >= 5:
        if scores["phq9"] > scores["gad7"]:
            primary_category = "DEPRESSION"
            reasoning = f"Mild-moderate depression (PHQ-9: {scores['phq9']}) - therapy recommended"
        else:
            primary_category = "ANXIETY"
            reasoning = (
                f"Mild-moderate anxiety (GAD-7: {scores['gad7']}) - anxiety management"
            )
        confidence = 0.75

    # Lifestyle/wellness focus
    else:
        primary_category = "LIFESTYLE"
        confidence = 0.80
        reasoning = "Low clinical scores - wellness and lifestyle optimization focus"

    return {
        "primary_category": primary_category,
        "confidence": confidence,
        "reasoning": reasoning,
        "clinical_scores": scores,
        "crisis_flag": scores["crisis_indicator"] >= 1,
    }


def create_test_cases():
    """Create test cases for different user profiles."""
    return [
        {
            "name": "🧠 High Anxiety Case",
            "description": "Young professional with severe anxiety symptoms",
            "data": {
                "age_range": "25-34",
                "primary_concern": "anxiety",
                "phq9_1": 1,
                "phq9_2": 2,
                "phq9_3": 1,
                "phq9_4": 2,
                "phq9_5": 1,
                "phq9_6": 1,
                "phq9_7": 2,
                "phq9_8": 0,
                "phq9_9": 0,
                "gad7_1": 3,
                "gad7_2": 2,
                "gad7_3": 3,
                "gad7_4": 2,
                "gad7_5": 2,
                "gad7_6": 1,
                "gad7_7": 2,
                "pcl5_1": 1,
                "pcl5_2": 0,
                "pcl5_3": 0,
                "pcl5_4": 1,
                "pcl5_5": 1,
                "pcl5_6": 0,
                "pcl5_7": 1,
                "pcl5_8": 0,
            },
        },
        {
            "name": "💙 Moderate Depression Case",
            "description": "Mid-career professional with depression symptoms",
            "data": {
                "age_range": "35-44",
                "primary_concern": "depression",
                "phq9_1": 3,
                "phq9_2": 3,
                "phq9_3": 2,
                "phq9_4": 3,
                "phq9_5": 2,
                "phq9_6": 2,
                "phq9_7": 2,
                "phq9_8": 1,
                "phq9_9": 0,
                "gad7_1": 1,
                "gad7_2": 1,
                "gad7_3": 2,
                "gad7_4": 1,
                "gad7_5": 0,
                "gad7_6": 1,
                "gad7_7": 1,
                "pcl5_1": 0,
                "pcl5_2": 1,
                "pcl5_3": 0,
                "pcl5_4": 0,
                "pcl5_5": 1,
                "pcl5_6": 2,
                "pcl5_7": 1,
                "pcl5_8": 0,
            },
        },
        {
            "name": "🛡️ Trauma Survivor Case",
            "description": "Individual with significant trauma history",
            "data": {
                "age_range": "35-44",
                "primary_concern": "trauma",
                "phq9_1": 2,
                "phq9_2": 2,
                "phq9_3": 3,
                "phq9_4": 2,
                "phq9_5": 1,
                "phq9_6": 1,
                "phq9_7": 2,
                "phq9_8": 1,
                "phq9_9": 0,
                "gad7_1": 2,
                "gad7_2": 2,
                "gad7_3": 3,
                "gad7_4": 2,
                "gad7_5": 1,
                "gad7_6": 2,
                "gad7_7": 3,
                "pcl5_1": 3,
                "pcl5_2": 4,
                "pcl5_3": 2,
                "pcl5_4": 3,
                "pcl5_5": 4,
                "pcl5_6": 2,
                "pcl5_7": 3,
                "pcl5_8": 2,
            },
        },
        {
            "name": "✨ Wellness-Focused Case",
            "description": "Health-conscious individual seeking lifestyle optimization",
            "data": {
                "age_range": "25-34",
                "primary_concern": "lifestyle",
                "phq9_1": 1,
                "phq9_2": 0,
                "phq9_3": 1,
                "phq9_4": 1,
                "phq9_5": 0,
                "phq9_6": 0,
                "phq9_7": 1,
                "phq9_8": 0,
                "phq9_9": 0,
                "gad7_1": 1,
                "gad7_2": 1,
                "gad7_3": 1,
                "gad7_4": 2,
                "gad7_5": 0,
                "gad7_6": 1,
                "gad7_7": 0,
                "pcl5_1": 0,
                "pcl5_2": 0,
                "pcl5_3": 0,
                "pcl5_4": 0,
                "pcl5_5": 0,
                "pcl5_6": 0,
                "pcl5_7": 0,
                "pcl5_8": 0,
            },
        },
        {
            "name": "🚨 Crisis Case",
            "description": "Individual expressing suicidal ideation - URGENT",
            "data": {
                "age_range": "25-34",
                "primary_concern": "depression",
                "phq9_1": 3,
                "phq9_2": 3,
                "phq9_3": 3,
                "phq9_4": 3,
                "phq9_5": 2,
                "phq9_6": 3,
                "phq9_7": 3,
                "phq9_8": 2,
                "phq9_9": 2,  # Suicidal ideation
                "gad7_1": 2,
                "gad7_2": 3,
                "gad7_3": 3,
                "gad7_4": 2,
                "gad7_5": 1,
                "gad7_6": 2,
                "gad7_7": 3,
                "pcl5_1": 1,
                "pcl5_2": 2,
                "pcl5_3": 1,
                "pcl5_4": 1,
                "pcl5_5": 2,
                "pcl5_6": 3,
                "pcl5_7": 2,
                "pcl5_8": 1,
            },
        },
    ]


def main():
    """Run the routing agent tests."""
    print("🎯 HarmoniAI Mental Health Routing Agent - Simple Test")
    print("=" * 60)
    print()

    test_cases = create_test_cases()

    for i, case in enumerate(test_cases, 1):
        print(f"Test Case {i}: {case['name']}")
        print(f"Description: {case['description']}")
        print("-" * 40)

        # Get routing decision
        result = route_user(case["data"])
        scores = result["clinical_scores"]

        print(f"📊 Clinical Scores:")
        print(f"   • PHQ-9 (Depression): {scores['phq9']}/27")
        print(f"   • GAD-7 (Anxiety): {scores['gad7']}/21")
        print(f"   • PCL-5 (Trauma): {scores['pcl5']}/32")
        print(
            f"   • Crisis Indicator: {'⚠️  YES' if scores['crisis_indicator'] >= 1 else '✅ NO'}"
        )
        print()

        # Show routing decision
        category_icons = {
            "ANXIETY": "🧠",
            "DEPRESSION": "💙",
            "TRAUMA": "🛡️",
            "LIFESTYLE": "✨",
            "CRISIS": "🚨",
        }

        icon = category_icons.get(result["primary_category"], "❓")
        print(f"🎯 ROUTING DECISION: {icon} {result['primary_category']}")
        print(f"📈 Confidence: {result['confidence']:.0%}")
        print(f"💭 Reasoning: {result['reasoning']}")

        if result["crisis_flag"]:
            print()
            print("🚨 CRISIS ALERT - IMMEDIATE ACTION REQUIRED:")
            print("   • Crisis Text Line: Text HOME to 741741")
            print("   • National Suicide Prevention Lifeline: 988")
            print("   • Emergency Services: 911")

        print()
        print("=" * 60)
        print()


if __name__ == "__main__":
    main()
