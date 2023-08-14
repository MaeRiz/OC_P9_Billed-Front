/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event"

import mockStore from "../__mocks__/store";
import {localStorageMock} from "../__mocks__/localStorage.js";

import NewBillUI from "../views/NewBillUI.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import NewBill from "../containers/NewBill.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {

  describe("When I submit a new Bill", () => {
    describe("When I send valid bill form", () => {
      test("Form is submit, bill is created", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))
  
        const html = NewBillUI()
        document.body.innerHTML = html
  
        const newBill = new NewBill({
          document, onNavigate, store: null, localStorage: window.localStorage
        })
  
        const form = screen.getByTestId("form-new-bill")
  
        expect(form).toBeTruthy()
  
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
  
        form.addEventListener("submit", handleSubmit);
        const submitBtn = screen.getByTestId('submit-button')
        userEvent.click(submitBtn);
  
        expect(handleSubmit).toHaveBeenCalled();
  
        const billsPage = screen.getByTestId("bills-title")
        expect(billsPage).toBeTruthy()
      });
    })

    describe("When I send not valid form", () => {
      test("Then submit button dosn't work", () => {

        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))
  
        const html = NewBillUI()
        document.body.innerHTML = html
  
        const submitBtn = screen.getByTestId('submit-button')
        userEvent.click(submitBtn);
  
        const NewBillPage = screen.getByTestId("title-new-bill")
        expect(NewBillPage).toBeTruthy()
      })
    })
  })


  describe("When I upload a file", () => {
    describe("When file isn't allowed", () => {
      test("Then form automatically deletes the file in the field", async() => {
        jest.spyOn(mockStore, "bills")
  
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }    
  
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))
  
        const html = NewBillUI()
        document.body.innerHTML = html
  
        const newBill = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })
  
        const file = new File(['test'], 'test.txt', {type: 'text/plain'});
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const billFile = screen.getByTestId('file');
    
        billFile.addEventListener("change", handleChangeFile);     
        userEvent.upload(billFile, file)
        
        const checkBillFile = screen.getByTestId('file');
        expect(checkBillFile.value).toEqual('')
        expect(handleChangeFile).toBeCalled()
  
      })
    })

    test("Then file is allowed", async() => {
      jest.spyOn(mockStore, "bills")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }      

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const form = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file');

      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file)
      
      expect(billFile.files[0].name).toBeDefined()
      expect(billFile.files[0].name).toEqual('image.png')
      expect(handleChangeFile).toBeCalled()
    })
  })
})
