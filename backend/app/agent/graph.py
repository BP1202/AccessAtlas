"""LangGraph StateGraph definition and orchestration runner for AccessAtlas.

Coordinates the end-to-end flow from cultural query discovery to structured
participation plans using explicit conditional edges and dependency injection.
"""

from datetime import UTC, datetime
from typing import Any

from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph

from app.agent.models import (
    AgentState,
    AgentWorkflowInput,
    AgentWorkflowOutput,
)
from app.agent.nodes import WorkflowNodes
from app.agent.resolution import CandidateResolver
from app.evidence.repository import VenueEvidenceRepository
from app.possibility.engine import PossibilityEngine
from app.qloo.client import QlooClient


def route_after_discovery(state: AgentState) -> str:
    """Conditional router after discovery node.

    If discovery encountered an error or yielded zero candidates, route directly
    to the planning node to produce an honest empty/error report.
    Otherwise, route to candidate resolution.
    """
    if state.get("discovery_error") or not state.get("discovered_entities"):
        return "plan"
    return "resolve"


def create_agent_graph(nodes: WorkflowNodes) -> CompiledStateGraph:
    """Construct and compile the LangGraph StateGraph.

    Graph Topology:
        START -> discover
                   |-- (error or 0 results) --> plan -> END
                   +-- (candidates found)  --> resolve -> evaluate -> plan -> END
    """
    workflow = StateGraph(AgentState)

    # Register nodes
    workflow.add_node("discover", nodes.discover_cultural_candidates)
    workflow.add_node("resolve", nodes.resolve_candidates)
    workflow.add_node("evaluate", nodes.evaluate_candidates)
    workflow.add_node("plan", nodes.build_participation_plans)

    # Define edges and conditional routing
    workflow.add_edge(START, "discover")
    workflow.add_conditional_edges(
        "discover",
        route_after_discovery,
        {
            "resolve": "resolve",
            "plan": "plan",
        },
    )
    workflow.add_edge("resolve", "evaluate")
    workflow.add_edge("evaluate", "plan")
    workflow.add_edge("plan", END)

    return workflow.compile()


class AccessAtlasAgent:
    """High-level orchestration agent running the compiled LangGraph workflow."""

    def __init__(
        self,
        qloo_client: QlooClient,
        resolver: CandidateResolver,
        evidence_repo: VenueEvidenceRepository,
        engine: PossibilityEngine | None = None,
    ) -> None:
        self.nodes = WorkflowNodes(
            qloo_client=qloo_client,
            resolver=resolver,
            evidence_repo=evidence_repo,
            engine=engine or PossibilityEngine(),
        )
        self.graph = create_agent_graph(self.nodes)

    def run(self, input_data: AgentWorkflowInput) -> AgentWorkflowOutput:
        """Execute the LangGraph workflow synchronously for the given user input."""
        eval_time = input_data.evaluation_time or datetime.now(UTC)

        initial_state: AgentState = {
            "cultural_query": input_data.cultural_query,
            "cultural_interests": input_data.cultural_interests,
            "target_type": input_data.target_type,
            "requirements": input_data.requirements,
            "max_candidates": input_data.max_candidates,
            "evaluation_time": eval_time,
            "discovered_entities": [],
            "resolved_candidates": [],
            "plans": [],
            "cultural_threads": [],
            "discovery_error": None,
            "workflow_summary": "",
            "raw_context": {},
        }

        final_state: dict[str, Any] = self.graph.invoke(initial_state)

        discovered = final_state.get("discovered_entities", [])
        resolved = final_state.get("resolved_candidates", [])
        plans = final_state.get("plans", [])
        threads = final_state.get("cultural_threads", [])

        return AgentWorkflowOutput(
            cultural_query=input_data.cultural_query,
            total_candidates_found=len(discovered),
            candidates_evaluated=len(resolved),
            plans=plans,
            cultural_threads=threads,
            discovery_error=final_state.get("discovery_error"),
            workflow_summary=final_state.get("workflow_summary", "Workflow completed."),
        )
