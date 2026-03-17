#!/usr/bin/env python3
"""
Script to create a graph visualization of DECA SCDC competition participants and their events.
"""

import re
import matplotlib.pyplot as plt
import networkx as nx
from collections import defaultdict
import numpy as np

def parse_pdf_data(pdf_path):
    """Parse the PDF text data to extract participant-event relationships."""
    try:
        with open(pdf_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        import sys
        print(f"Warning: Could not read {pdf_path}")
        return {}, {}
    
    # Split by lines
    lines = [l.strip() for l in content.split('\n') if l.strip()]
    
    # Dictionary to store: event -> count of entries/teams (not individual participants)
    event_counts = defaultdict(int)
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Skip headers and page numbers
        if not line or 'SCHEDULES' in line or line == 'Name' or 'Page' in line or 'Created:' in line or '--' in line:
            i += 1
            continue
        
        # Skip single-letter lines (PDF extraction artifacts)
        if len(line) == 1 and line.isalpha():
            i += 1
            continue
        
        # Look for data rows - they start with a name (contains comma, is a full name, or is a single capitalized word)
        # Pattern: Name(s) followed by Event name
        # Single-word names like "Peppas", "Mehra" should also be detected
        is_name_line = False
        if ',' in line:
            is_name_line = True
        elif len(line.split()) >= 2 and line[0].isupper():
            is_name_line = True
        elif len(line.split()) == 1 and line[0].isupper() and len(line) > 2:
            # Single capitalized word that's not too short (likely a last name)
            # Check if next line looks like an event to confirm
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                if (len(next_line) >= 15 and any(keyword in next_line for keyword in 
                    ['Marketing', 'Business', 'Finance', 'Hospitality', 'Tourism', 'Entrepreneurship', 
                     'Operations', 'Team Decision', 'Role Play', 'Presentation', 'Series', 'Event', 'Project', 'Plan',
                     'Growth', 'Solutions', 'Awareness', 'Giving', 'Development', 'Literacy', 'Selling'])) or \
                   (len(next_line) > 20):
                    is_name_line = True
        
        if is_name_line:
            # This might be a name line
            names_str = line
            
            # Look ahead for the event name (usually on next line or same line)
            # Events are usually longer phrases
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                # Check if next line looks like an event (contains keywords or is reasonably long)
                # Events typically contain business/marketing keywords or are presentation/role play types
                if (len(next_line) >= 15 and any(keyword in next_line for keyword in 
                    ['Marketing', 'Business', 'Finance', 'Hospitality', 'Tourism', 'Entrepreneurship', 
                     'Operations', 'Team Decision', 'Role Play', 'Presentation', 'Series', 'Event', 'Project', 'Plan',
                     'Growth', 'Solutions', 'Awareness', 'Giving', 'Development', 'Literacy', 'Selling'])) or \
                   (len(next_line) > 20):
                    event = next_line
                    i += 2  # Skip both lines
                else:
                    # Event might be on same line after tab/space
                    parts = line.split('\t')
                    if len(parts) >= 2:
                        names_str = parts[0]
                        event = parts[1]
                        i += 1
                    else:
                        i += 1
                        continue
            else:
                i += 1
                continue
            
            # Count this as ONE entry/team, regardless of how many people are in the team
            if names_str and event and len(event) > 5:  # Valid event name
                # Exclude column headers and schedule types that aren't actual events
                excluded_terms = ['Preparation Area Time', 'Presentation Time', 'Holding Time', 
                                 'Role Play', 'Presentation', 'Schedule', 'Section', 'Date',
                                 'Time', 'AM', 'PM', 'of 34', 'Created:']
                if any(term in event for term in excluded_terms):
                    i += 1
                    continue
                
                # Check if names_str looks like actual names (not just random text)
                name_parts = [n.strip() for n in names_str.split(',')]
                has_valid_name = False
                for name_part in name_parts:
                    name_part = name_part.strip()
                    if name_part and len(name_part) > 1 and name_part[0].isalpha():
                        has_valid_name = True
                        break
                
                if has_valid_name:
                    event_counts[event] += 1
        else:
            i += 1
    
    # Convert to the format expected by the rest of the code
    # For bar chart, we just need counts, but keep the old format for compatibility
    event_participants = {event: set(range(count)) for event, count in event_counts.items()}
    participant_events = {}
    
    return event_participants, participant_events, event_counts

def create_graph(event_participants, participant_events):
    """Create a bipartite graph from the data."""
    G = nx.Graph()
    
    # Add event nodes (one type)
    for event in event_participants.keys():
        G.add_node(event, node_type='event')
    
    # Add participant nodes (another type)
    for participant in participant_events.keys():
        G.add_node(participant, node_type='participant')
    
    # Add edges between participants and events
    for event, participants in event_participants.items():
        for participant in participants:
            G.add_edge(participant, event)
    
    return G

def visualize_graph(event_participants, output_path='deca_event_graph.png', event_counts=None):
    """Create a bar chart showing number of teams/entries per event."""
    # Use provided counts if available, otherwise count from participants
    if event_counts:
        counts_dict = event_counts
    else:
        counts_dict = {event: len(participants) for event, participants in event_participants.items()}
    
    # Sort events by count (descending)
    sorted_events = sorted(counts_dict.items(), key=lambda x: x[1], reverse=True)
    events = [e[0] for e in sorted_events]
    counts = [e[1] for e in sorted_events]
    
    # Create figure with appropriate size
    fig, ax = plt.subplots(figsize=(16, max(10, len(events) * 0.4)))
    
    # Create horizontal bar chart (easier to read event names)
    bars = ax.barh(range(len(events)), counts, color='steelblue', alpha=0.8)
    
    # Set y-axis labels to event names
    ax.set_yticks(range(len(events)))
    ax.set_yticklabels(events, fontsize=9)
    
    # Set x-axis label
    ax.set_xlabel('Number of Teams/Entries', fontsize=12, fontweight='bold')
    
    # Add value labels on bars
    for i, (bar, count) in enumerate(zip(bars, counts)):
        ax.text(count + 0.5, i, str(count), 
               va='center', fontsize=9, fontweight='bold')
    
    # Set title
    ax.set_title('DECA SCDC Competition: Number of Teams/Entries per Event', 
                fontsize=14, fontweight='bold', pad=20)
    
    # Invert y-axis so highest count is at top
    ax.invert_yaxis()
    
    # Add grid for easier reading
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    
    # Adjust layout
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Bar chart saved to {output_path}")
    
    return sorted_events

def create_summary_statistics(event_participants, participant_events, event_counts=None):
    """Print summary statistics."""
    print("\n" + "="*60)
    print("DECA SCDC Competition Summary Statistics")
    print("="*60)
    
    if event_counts:
        counts_dict = event_counts
    else:
        counts_dict = {event: len(participants) for event, participants in event_participants.items()}
    
    print(f"Total number of events: {len(counts_dict)}")
    print(f"Total number of teams/entries: {sum(counts_dict.values())}")
    
    # Events with most teams/entries
    print("\nTop 10 Events by Number of Teams/Entries:")
    sorted_events = sorted(counts_dict.items(), key=lambda x: x[1], reverse=True)
    for i, (event, count) in enumerate(sorted_events[:10], 1):
        print(f"{i:2d}. {event}: {count} teams/entries")
    
    # Participants in most events
    print("\nParticipants in Multiple Events:")
    multi_event_participants = {p: events for p, events in participant_events.items() if len(events) > 1}
    if multi_event_participants:
        sorted_participants = sorted(multi_event_participants.items(), key=lambda x: len(x[1]), reverse=True)
        for participant, events in sorted_participants[:10]:
            print(f"  {participant}: {len(events)} events - {', '.join(list(events)[:3])}...")
    else:
        print("  None found")
    
    print("="*60 + "\n")

def main():
    import os
    # Use text file path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    text_path = os.path.join(os.path.dirname(script_dir), 'scdc_data.txt')
    output_path = '/Users/havishkunchanapalli/cropintel/deca_event_graph.png'
    
    print("Parsing PDF data...")
    if not os.path.exists(text_path):
        # Try PDF path as fallback
        pdf_path = '/Users/havishkunchanapalli/Downloads/SCDC Event Schedules (1).pdf'
        if os.path.exists(pdf_path):
            text_path = pdf_path
    
    event_participants, participant_events, event_counts = parse_pdf_data(text_path)
    
    print("Generating bar chart visualization...")
    visualize_graph(event_participants, output_path, event_counts)
    
    print("Generating summary statistics...")
    create_summary_statistics(event_participants, participant_events, event_counts)
    
    print(f"\nGraph visualization saved to: {output_path}")

if __name__ == '__main__':
    main()
