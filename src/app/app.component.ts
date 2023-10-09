import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { randomInt } from "./utils/randomInt";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "rule34";
  imageUrl: string = "";
  id: string = "";
  image: SafeHtml = "";
  reloadInterval: number = 5000;

  changeInterval(event: Event) {
    this.reloadInterval = parseInt((event.target as HTMLInputElement).value);
    localStorage.setItem("reloadInterval", this.reloadInterval.toString());
  }

  ngOnInit() {
    this.id = randomInt(1, 8000000).toString();
    if (typeof window === "undefined") return;

    if (!localStorage.getItem("reloadInterval")) {
      localStorage.setItem("reloadInterval", "5000");
    }

    fetch("/image/" + this.id)
      .then((res) => res.text())
      .then((text) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const imageUrlElement = doc.querySelector("img#image");

        if (imageUrlElement === null) {
          window.location.reload();
        }

        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(
          imageUrlElement.getAttribute("src").replace("//samples", "/samples")
        );

        setTimeout(() => {
          this.ngOnInit();
        }, this.reloadInterval);
      });
  }

  constructor(private sanitizer: DomSanitizer) {}
}
