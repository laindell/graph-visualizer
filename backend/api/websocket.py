import socketio
from typing import Dict, Optional
import asyncio
from algorithms import BFSStep
from services.graph_service import graph_service

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)


class BFSSession:
    def __init__(self, graph_id: str, start: str, goal: str, order_type: str, speed: float):
        self.graph_id = graph_id
        self.start = start
        self.goal = goal
        self.order_type = order_type
        self.speed = speed
        self.current_step = 0
        self.is_running = False
        self.is_paused = False
        self.result = None
        self.task: Optional[asyncio.Task] = None


sessions: Dict[str, BFSSession] = {}


@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    if sid in sessions:
        session = sessions[sid]
        if session.task and not session.task.done():
            session.task.cancel()
        del sessions[sid]


@sio.event
async def bfs_start(sid, data):
    try:
        graph_id = data.get('graph_id')
        start_node = data.get('start_node')
        goal_node = data.get('goal_node')
        order_type = data.get('order_type', 'id_asc')
        speed = data.get('speed', 1.0)

        result = graph_service.prepare_bfs(graph_id, start_node, goal_node, order_type)

        session = BFSSession(graph_id, start_node, goal_node, order_type, speed)
        session.result = result
        session.is_running = True
        sessions[sid] = session

        session.task = asyncio.create_task(run_bfs_animation(sid, session))

    except Exception as e:
        await sio.emit('bfs_error', {'error': str(e)}, room=sid)


async def run_bfs_animation(sid: str, session: BFSSession):
    try:
        if not session.result or not session.result.history:
            await sio.emit('bfs_error', {'error': 'No BFS result available'}, room=sid)
            return

        while session.is_running and session.current_step < len(session.result.history):
            if not session.is_running:
                break

            while session.is_paused:
                await asyncio.sleep(0.1)
                if not session.is_running:
                    return

            step = session.result.history[session.current_step]

            metrics = {
                'current_step': session.current_step,
                'total_steps': len(session.result.history),
                'visited_count': len(step.visited),
                'queue_size': len(step.queue)
            }

            await sio.emit('bfs_step_update', {
                'step': step.dict(),
                'metrics': metrics
            }, room=sid)

            delay = 1.0 / session.speed
            await asyncio.sleep(delay)

            session.current_step += 1

        if session.is_running:
            await sio.emit('bfs_complete', {
                'result': session.result.dict()
            }, room=sid)

    except asyncio.CancelledError:
        print(f"BFS animation cancelled for session {sid}")
    except Exception as e:
        await sio.emit('bfs_error', {'error': str(e)}, room=sid)


@sio.event
async def bfs_pause(sid, data):
    if sid in sessions:
        sessions[sid].is_paused = True


@sio.event
async def bfs_resume(sid, data):
    if sid in sessions:
        sessions[sid].is_paused = False


@sio.event
async def bfs_stop(sid, data):
    if sid in sessions:
        session = sessions[sid]
        session.is_running = False
        if session.task and not session.task.done():
            session.task.cancel()


@sio.event
async def bfs_step(sid, data):
    if sid not in sessions:
        return

    session = sessions[sid]
    direction = data.get('direction', 'forward')

    if direction == 'forward' and session.current_step < len(session.result.history) - 1:
        session.current_step += 1
    elif direction == 'backward' and session.current_step > 0:
        session.current_step -= 1

    step = session.result.history[session.current_step]
    metrics = {
        'current_step': session.current_step,
        'total_steps': len(session.result.history),
        'visited_count': len(step.visited),
        'queue_size': len(step.queue)
    }

    await sio.emit('bfs_step_update', {
        'step': step.dict(),
        'metrics': metrics
    }, room=sid)


@sio.event
async def bfs_seek(sid, data):
    if sid not in sessions:
        return

    session = sessions[sid]
    step_number = data.get('step_number', 0)

    if 0 <= step_number < len(session.result.history):
        was_running = session.is_running and not session.is_paused

        if session.task and not session.task.done():
            session.is_running = False
            session.task.cancel()
            try:
                await session.task
            except asyncio.CancelledError:
                pass

        session.current_step = step_number
        step = session.result.history[session.current_step]

        metrics = {
            'current_step': session.current_step,
            'total_steps': len(session.result.history),
            'visited_count': len(step.visited),
            'queue_size': len(step.queue)
        }

        await sio.emit('bfs_step_update', {
            'step': step.dict(),
            'metrics': metrics
        }, room=sid)

        if was_running:
            session.is_running = True
            session.is_paused = False
            session.task = asyncio.create_task(run_bfs_animation(sid, session))
