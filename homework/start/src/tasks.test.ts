import { describe, expect, it } from "vitest"
import {
    createTask,
    isBlankTitle,
    openCount,
    renameTask,
    seedTasks,
    visibleTasks,
} from "./tasks"

describe("базовая доска", () => {
    it("создаёт задачу и обрезает название", () => {
        const task = createTask(9, " \t\u00A0Купить хлеб\u00A0 ")
        expect(task?.title).toBe("Купить хлеб")
    })

    it("фильтрует готовые задачи", () => {
        expect(visibleTasks(seedTasks, "done").map((task) => task.id)).toEqual([2])
    })
})

describe("R1: переименование и пробельные символы", () => {
    it("отклоняет название из пробелов, табуляции и неразрывного пробела", () => {
        expect(renameTask(seedTasks, 1, "   ")[0].title).toBe("Сдать лабораторную")
        expect(renameTask(seedTasks, 1, "\t\t")[0].title).toBe("Сдать лабораторную")
        expect(renameTask(seedTasks, 1, "\u00A0")[0].title).toBe("Сдать лабораторную")
        expect(isBlankTitle(" \t\u00A0 ")).toBe(true)
    })

    it("обрезает пробельные символы по краям при переименовании", () => {
        const updated = renameTask(seedTasks, 1, " \t\u00A0Новая задача\u00A0 ")
        expect(updated[0].title).toBe("Новая задача")
    })
})

describe("R2: унаследованная пустая строка", () => {
    it("скрывает задачи с пустым названием во всех фильтрах", () => {
        expect(visibleTasks(seedTasks, "all").map((task) => task.id)).toEqual([1, 2])
        expect(visibleTasks(seedTasks, "open").map((task) => task.id)).toEqual([1])
        expect(visibleTasks(seedTasks, "done").map((task) => task.id)).toEqual([2])
    })
})

describe("R3: счётчик открытых задач", () => {
    it("не считает задачи с пустым названием", () => {
        expect(openCount(seedTasks)).toBe(1)
    })
})

describe("Изменение требования: U+200B (zero-width space)", () => {
    it("считает строку из U+200B пустой и обрезает U+200B по краям", () => {
        expect(isBlankTitle("\u200B")).toBe(true)
        expect(createTask(9, "\u200B")).toBeUndefined()
        expect(renameTask(seedTasks, 1, "\u200B")[0].title).toBe("Сдать лабораторную")
        expect(renameTask(seedTasks, 1, "\u200BНовая задача\u200B")[0].title).toBe("Новая задача")
        expect(visibleTasks([{ id: 4, title: "\u200B", done: false }], "all")).toEqual([])
        expect(openCount([{ id: 4, title: "\u200B", done: false }])).toBe(0)
    })
})
