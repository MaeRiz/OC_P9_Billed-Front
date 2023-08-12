/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then mail icon in vertical layout should not be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList.contains('active-icon')).toBeFalsy()

    })
    test("Then bills should be ordered from earliest to latest", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)

    })
    describe("When I click on new bill button", () => {
      test("Then redirect to new bill form", () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
  
        const btnNewBill = screen.getByTestId('btn-new-bill')
        userEvent.click(btnNewBill)
  
        expect(screen.getByTestId('title-new-bill').textContent).toEqual(' Envoyer une note de frais ')
  
      })
    })
    
    describe("When I click on icon eye button", () => {
      test("Then  open modal", () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
  
        $.fn.modal = jest.fn()
  
        const iconEyeBtn = screen.getAllByTestId('icon-eye')
        userEvent.click(iconEyeBtn[0])
  
        expect(screen.getByTestId('modal-title').textContent).toEqual('Justificatif')
      })
    })
  

    describe("When I navigate to Bills", () => {
      test("Then fetches bills from mock API GET", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))
        new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })    
        document.body.innerHTML = BillsUI({ data: bills })
        await waitFor(() => screen.getByText("Mes notes de frais"))
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      })
    })
  
  
    describe("When error on fetching bills data API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            "localStorage",
            { value: localStorageMock }
        )
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee",
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
  
      test("Then API error is not found", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        const html = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html
        const msgErr = await screen.getByText(/Erreur 404/)
        expect(msgErr).toBeTruthy()
      })
  
      test("Then API error is internal server", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        const html = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html
        const msgErr = await screen.getByText(/Erreur 500/)
        expect(msgErr).toBeTruthy()
      })
    })
  })
})
