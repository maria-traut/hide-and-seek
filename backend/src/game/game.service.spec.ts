import type { Movement } from "@hide-and-seek/shared";
import type { Socket } from "socket.io";

import { GameService } from "./game.service.js";

type Emitted = { event: string; data: unknown };

function createServer() {
	const rooms = new Map<string, Set<string>>();
	const emitted: Emitted[] = [];
	const nsp = {
		adapter: { rooms },
		to: () => ({
			emit: (event: string, data: unknown) => emitted.push({ event, data }),
		}),
	};

	function connect(id: string) {
		const client = {
			id,
			rooms: new Set([id]),
			nsp,
			join: (roomId: string) => {
				client.rooms.add(roomId);
				rooms.set(roomId, (rooms.get(roomId) ?? new Set()).add(id));
			},
		};
		return client as unknown as Socket;
	}

	return { connect, emitted };
}

describe("GameService", () => {
	let service: GameService;
	let server: ReturnType<typeof createServer>;
	let seeker: Socket;
	let hider: Socket;

	function move(client: Socket, movement: Movement, times = 1) {
		for (let i = 0; i < times; i++) {
			service.movePlayer(client, movement);
		}
	}

	function lastPosition() {
		return server.emitted.filter((e) => e.event === "playerAction").at(-1)?.data;
	}

	beforeEach(async () => {
		vi.useFakeTimers();
		vi.spyOn(Math, "random").mockReturnValue(0);
		vi.spyOn(console, "log").mockImplementation(() => {});

		service = new GameService();
		server = createServer();
		seeker = server.connect("seeker");
		hider = server.connect("hider");
		await service.addPlayer(seeker);
		await service.addPlayer(hider);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("starts with the seeker and the hider in opposite corners", () => {
		const game = server.emitted.find((e) => e.event === "gameData")?.data;

		expect(game).toMatchObject({
			status: "running",
			players: {
				seeker: { role: "seeker", position: { x: 0, y: 0 } },
				hider: { role: "hider", position: { x: 9, y: 9 } },
			},
		});
	});

	it("moves a player by one field", () => {
		move(seeker, "right");

		expect(lastPosition()).toEqual({ clientId: "seeker", position: { x: 1, y: 0 } });
	});

	it("keeps players inside the grid", () => {
		move(seeker, "up");
		move(seeker, "left");
		move(hider, "down");
		move(hider, "right");

		expect(lastPosition()).toBeUndefined();
	});

	it("lets the seeker win by catching the hider", () => {
		move(hider, "up", 9);
		move(hider, "left", 8);
		move(seeker, "right");

		expect(server.emitted.at(-1)).toEqual({
			event: "gameEnd",
			data: { reason: "caught", winner: "seeker" },
		});
	});

	it("lets the hider win when the time runs out", () => {
		vi.advanceTimersByTime(30_000);

		expect(server.emitted.at(-1)).toEqual({
			event: "gameEnd",
			data: { reason: "timeout", winner: "hider" },
		});
	});
});
